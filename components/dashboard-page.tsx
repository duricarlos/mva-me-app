"use client"

import { useState, useEffect } from "react"
import { SignOutButton } from '@clerk/nextjs'
import type { SalesPoint } from "@/lib/types"
import { MapComponent } from "./map-component"
import { SalesPointsList } from "./sales-points-list"
import { Button } from "./ui/button"
import { useSellerData } from "@/lib/use-seller-data"

export function DashboardPage() {
  const [selectedPoint, setSelectedPoint] = useState<SalesPoint | null>(null)
  const [locationStatus, setLocationStatus] = useState<{
    isInside: boolean | null
    isInForeignZone: boolean | null
    foreignZoneName: string | null
    nearForeignPoint: boolean | null
    foreignPointName: string | null
    foreignPointDistance: number | null
    lastCheck: Date | null
    error: string | null
  }>({
    isInside: null,
    isInForeignZone: null,
    foreignZoneName: null,
    nearForeignPoint: null,
    foreignPointName: null,
    foreignPointDistance: null,
    lastCheck: null,
    error: null
  })
  const { data, loading, error } = useSellerData()

  // Función para verificar si un punto está dentro de un polígono (algoritmo ray casting)
  const pointInPolygon = (point: [number, number], polygon: [number, number][][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    // Usar el primer anillo del polígono (exterior)
    const ring = polygon[0];
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // Función para calcular distancia entre dos puntos en metros
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Hook de geolocalización - debe estar antes de cualquier return condicional
  useEffect(() => {
    if (!data?.assignedSalesZones?.length) return;

    const assignedZones = data.assignedSalesZones;
    const allZones = data.allSalesZones || [];

    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Ubicación actual:", { latitude, longitude });
          
          // Verificar si está dentro de alguna zona asignada
          let isInsideAssignedZone = false;
          for (const zone of assignedZones) {
            if (pointInPolygon([longitude, latitude], zone.coordinates)) {
              isInsideAssignedZone = true;
              break;
            }
          }
          
          // Verificar si está dentro de alguna zona no asignada
          let isInForeignZone = false;
          let foreignZoneName = null;
          
          if (!isInsideAssignedZone) {
            const assignedZoneIds = new Set(assignedZones.map(zone => zone.id));
            for (const zone of allZones) {
              if (!assignedZoneIds.has(zone.id) && pointInPolygon([longitude, latitude], zone.coordinates)) {
                isInForeignZone = true;
                foreignZoneName = zone.name;
                break;
              }
            }
          }

          // Verificar proximidad a puntos no asignados (dentro de 100 metros)
          let nearForeignPoint = false;
          let foreignPointName = null;
          let foreignPointDistance = null;
          const PROXIMITY_THRESHOLD = 100; // metros
          
          const assignedPointIds = new Set(assignedPoints.map(point => point.id));
          for (const point of allPoints) {
            if (!assignedPointIds.has(point.id)) {
              const distance = calculateDistance(
                latitude, longitude,
                point.coordinates[1], point.coordinates[0]
              );
              
              if (distance <= PROXIMITY_THRESHOLD) {
                nearForeignPoint = true;
                foreignPointName = point.name;
                foreignPointDistance = Math.round(distance);
                break; // Solo reportar el más cercano
              }
            }
          }
          
          console.log("¿Está dentro de zona asignada?", isInsideAssignedZone);
          console.log("¿Está en zona ajena?", isInForeignZone, foreignZoneName);
          console.log("¿Cerca de punto no asignado?", nearForeignPoint, foreignPointName, foreignPointDistance);
          
          setLocationStatus({
            isInside: isInsideAssignedZone,
            isInForeignZone,
            foreignZoneName,
            nearForeignPoint,
            foreignPointName,
            foreignPointDistance,
            lastCheck: new Date(),
            error: null
          });
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
          setLocationStatus(prev => ({
            ...prev,
            error: `Error de geolocalización: ${error.message}`
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    };

    // Verificar ubicación inmediatamente
    checkLocation();

    // Configurar verificación periódica cada 5 segundos
    const interval = setInterval(checkLocation, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [data?.assignedSalesZones, data?.allSalesZones, data?.assignedSalesPoints, data?.allSalesPoints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-gray-300">{error}</p>
          </div>
          <SignOutButton>
            <Button variant="secondary">Volver al inicio</Button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">Perfil no configurado</h2>
            <p className="text-gray-300">Tu perfil de vendedor aún no ha sido configurado por el administrador.</p>
          </div>
          <SignOutButton>
            <Button variant="secondary">Salir</Button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  // Obtener zonas y puntos asignados y todos
  const assignedZones = data.assignedSalesZones
  const allZones = data.allSalesZones
  const assignedPoints = data.assignedSalesPoints
  const allPoints = data.allSalesPoints

  console.log("Assigned Zones:", assignedZones)
  console.log("All Zones:", allZones)
  console.log("Assigned Points:", assignedPoints)
  console.log("All Points:", allPoints) 

  // Calcular color de zona basado en ubicación
  const zoneColor = locationStatus.isInForeignZone 
    ? "#EF4444" // Rojo si está en zona ajena
    : locationStatus.isInside === null 
      ? "#FFC300" // Amarillo verificando
      : locationStatus.isInside 
        ? "#22C55E" // Verde dentro de zona asignada
        : "#EF4444"; // Rojo fuera de zona

  if (!assignedZones.length || assignedPoints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-yellow-400 mb-2">Zona o puntos no asignados</h2>
            <p className="text-gray-300">No tienes zonas o puntos de venta asignados actualmente.</p>
          </div>
          <SignOutButton>
            <Button variant="secondary">Salir</Button>
          </SignOutButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hola, {data.profile.name}</h1>
              <p className="text-sm text-gray-400">
                {assignedZones.length > 0 ? assignedZones[0].name : 'Sin zona asignada'} • {assignedPoints.length} puntos de venta
              </p>
            </div>
          </div>
          <SignOutButton>
            <Button variant="secondary" size="sm" className="shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Salir
            </Button>
          </SignOutButton>
        </div>
      </header>

      {/* Alerta de Zona Ajena */}
      {locationStatus.isInForeignZone && (
        <div className="bg-red-600 border-b border-red-500 p-3 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <p className="text-white font-semibold">
              ⚠️ ALERTA: Estás en una zona no asignada - {locationStatus.foreignZoneName}
            </p>
          </div>
          <p className="text-red-100 text-sm mt-1">
            Debes dirigirte a tu zona asignada inmediatamente
          </p>
        </div>
      )}

      {/* Alerta de Proximidad a Punto No Asignado */}
      {!locationStatus.isInForeignZone && locationStatus.nearForeignPoint && (
        <div className="bg-orange-600 border-b border-orange-500 p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <p className="text-white font-semibold">
              📍 AVISO: Cerca de punto no asignado - {locationStatus.foreignPointName}
            </p>
          </div>
          <p className="text-orange-100 text-sm mt-1">
            Distancia: {locationStatus.foreignPointDistance}m - Este punto no está asignado a tu zona
          </p>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Map */}
        <div className="h-[60vh] relative">
          <MapComponent
            assignedPoints={assignedPoints}
            allPoints={allPoints}
            assignedZones={assignedZones}
            allZones={allZones}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            className="h-full"
            zoneColor={zoneColor}
          />

          {/* Floating stats */}
          <div className="absolute top-4 left-4 right-4 flex gap-2">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-700/50">
              <p className="text-xs text-gray-400">Zona</p>
              <p className="text-sm font-semibold text-white">{assignedZones.length > 0 ? assignedZones[0].name : 'Sin zona'}</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-700/50">
              <p className="text-xs text-gray-400">Puntos</p>
              <p className="text-sm font-semibold text-yellow-400">{assignedPoints.length}</p>
            </div>
            {/* Estado de ubicación */}
            <div className={`bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border ${
              locationStatus.isInForeignZone 
                ? 'border-red-600/80' 
                : locationStatus.isInside === null 
                  ? 'border-gray-700/50' 
                  : locationStatus.isInside 
                    ? 'border-green-500/50' 
                    : 'border-red-500/50'
            }`}>
              <p className="text-xs text-gray-400">Ubicación</p>
              <p className={`text-sm font-semibold ${
                locationStatus.isInForeignZone 
                  ? 'text-red-500' 
                  : locationStatus.isInside === null 
                    ? 'text-gray-400' 
                    : locationStatus.isInside 
                      ? 'text-green-400' 
                      : 'text-red-400'
              }`}>
                {locationStatus.isInForeignZone 
                  ? `⚠️ En zona ajena: ${locationStatus.foreignZoneName}` 
                  : locationStatus.isInside === null 
                    ? 'Verificando...' 
                    : locationStatus.isInside 
                      ? '✅ En zona asignada' 
                      : '❌ Fuera de zona'
                }
              </p>
            </div>
            {/* Estado de proximidad a puntos */}
            {locationStatus.nearForeignPoint && (
              <div className="bg-orange-600/80 backdrop-blur-md rounded-lg px-3 py-2 border border-orange-500/50">
                <p className="text-xs text-orange-200">Punto cercano</p>
                <p className="text-sm font-semibold text-white">
                  📍 {locationStatus.foreignPointDistance}m
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Points List */}
        <div className="h-[40vh] bg-gray-800/90 backdrop-blur-md border-t border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              Puntos de Venta
            </h2>
          </div>
          <SalesPointsList
            assignedPoints={assignedPoints}
            allPoints={allPoints}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-80px)]">
        {/* Left Column - Points List */}
        <div className="w-96 bg-gray-800/90 backdrop-blur-md border-r border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              Puntos de Venta
            </h2>
          </div>
          <SalesPointsList
            assignedPoints={assignedPoints}
            allPoints={allPoints}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            showSearch={true}
          />
        </div>

        {/* Right Column - Map */}
        <div className="flex-1 relative">
          <MapComponent
            assignedPoints={assignedPoints}
            allPoints={allPoints}
            assignedZones={assignedZones}
            allZones={allZones}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            className="h-full"
            zoneColor={zoneColor}
          />

          {/* Desktop stats overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border border-gray-700/50 shadow-lg">
              <p className="text-xs text-gray-400 mb-1">Zona Asignada</p>
              <p className="text-sm font-semibold text-white">{assignedZones.length > 0 ? assignedZones[0].name : 'Sin zona'}</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border border-gray-700/50 shadow-lg">
              <p className="text-xs text-gray-400 mb-1">Total Puntos</p>
              <p className="text-lg font-bold text-yellow-400">{assignedPoints.length}</p>
            </div>
            {/* Estado de ubicación */}
            <div className={`bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border shadow-lg ${
              locationStatus.isInForeignZone 
                ? 'border-red-600/80' 
                : locationStatus.isInside === null 
                  ? 'border-gray-700/50' 
                  : locationStatus.isInside 
                    ? 'border-green-500/50' 
                    : 'border-red-500/50'
            }`}>
              <p className="text-xs text-gray-400 mb-1">Estado de Ubicación</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  locationStatus.isInForeignZone 
                    ? 'bg-red-500' 
                    : locationStatus.isInside === null 
                      ? 'bg-gray-400' 
                      : locationStatus.isInside 
                        ? 'bg-green-400' 
                        : 'bg-red-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  locationStatus.isInForeignZone 
                    ? 'text-red-500' 
                    : locationStatus.isInside === null 
                      ? 'text-gray-400' 
                      : locationStatus.isInside 
                        ? 'text-green-400' 
                        : 'text-red-400'
                }`}>
                  {locationStatus.isInForeignZone 
                    ? `⚠️ ZONA AJENA: ${locationStatus.foreignZoneName}` 
                    : locationStatus.isInside === null 
                      ? 'Verificando ubicación...' 
                      : locationStatus.isInside 
                        ? '✅ Dentro de zona asignada' 
                        : '❌ Fuera de zona asignada'
                  }
                </p>
              </div>
              {locationStatus.lastCheck && (
                <p className="text-xs text-gray-500 mt-1">
                  Última verificación: {locationStatus.lastCheck.toLocaleTimeString()}
                </p>
              )}
              {locationStatus.error && (
                <p className="text-xs text-red-400 mt-1">
                  {locationStatus.error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}