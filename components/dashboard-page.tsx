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
    lastCheck: Date | null
    error: string | null
  }>({
    isInside: null,
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

  // Hook de geolocalización - debe estar antes de cualquier return condicional
  useEffect(() => {
    if (!data?.salesZones?.[0]) return;

    const assignedZone = data.salesZones[0];

    const checkLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Ubicación actual:", { latitude, longitude });
          console.log("Coordenadas de zona:", assignedZone.coordinates);
          
          // Verificar si está dentro del polígono
          const isInsideZone = pointInPolygon([longitude, latitude], assignedZone.coordinates);
          
          console.log("¿Está dentro de la zona?", isInsideZone);
          
          setLocationStatus({
            isInside: isInsideZone,
            lastCheck: new Date(),
            error: null
          });

          // Cambiar color de la zona en el mapa
          setTimeout(() => {
            const fillLayer = document.querySelector('.maplibregl-canvas-container');
            if (fillLayer) {
              // Intentar cambiar el estilo del mapa
              const mapInstance = (window as any).mapInstance; // eslint-disable-line @typescript-eslint/no-explicit-any
              if (mapInstance && mapInstance.getLayer && mapInstance.getLayer('sales-zone-fill')) {
                mapInstance.setPaintProperty(
                  'sales-zone-fill',
                  'fill-color',
                  isInsideZone ? '#FFC300' : '#FF0000'
                );
                mapInstance.setPaintProperty(
                  'sales-zone-line',
                  'line-color',
                  isInsideZone ? '#FFC300' : '#FF0000'
                );
              }
            }
          }, 100);
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
  }, [data?.salesZones]);

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

  // Usar la primera zona asignada como zona principal (en el futuro se podría seleccionar)
  const assignedZone = data.salesZones[0]
  const assignedPoints = data.salesPoints

  console.log("Assigned Zone:", assignedZone)
  console.log("Assigned Points:", assignedPoints) 


  // Calcular color de zona basado en ubicación
  const zoneColor = locationStatus.isInside === null 
    ? "#FFC300" 
    : locationStatus.isInside 
      ? "#22C55E" 
      : "#EF4444";

  if (!assignedZone || assignedPoints.length === 0) {
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
                {assignedZone.name} • {assignedPoints.length} puntos de venta
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

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Map */}
        <div className="h-[60vh] relative">
          <MapComponent
            salesPoints={assignedPoints}
            salesZone={assignedZone}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            className="h-full"
            zoneColor={zoneColor}
          />

          {/* Floating stats */}
          <div className="absolute top-4 left-4 right-4 flex gap-2">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-700/50">
              <p className="text-xs text-gray-400">Zona</p>
              <p className="text-sm font-semibold text-white">{assignedZone.name}</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-700/50">
              <p className="text-xs text-gray-400">Puntos</p>
              <p className="text-sm font-semibold text-yellow-400">{assignedPoints.length}</p>
            </div>
            {/* Estado de ubicación */}
            <div className={`bg-gray-900/80 backdrop-blur-md rounded-lg px-3 py-2 border ${
              locationStatus.isInside === null 
                ? 'border-gray-700/50' 
                : locationStatus.isInside 
                  ? 'border-green-500/50' 
                  : 'border-red-500/50'
            }`}>
              <p className="text-xs text-gray-400">Ubicación</p>
              <p className={`text-sm font-semibold ${
                locationStatus.isInside === null 
                  ? 'text-gray-400' 
                  : locationStatus.isInside 
                    ? 'text-green-400' 
                    : 'text-red-400'
              }`}>
                {locationStatus.isInside === null 
                  ? 'Verificando...' 
                  : locationStatus.isInside 
                    ? 'En zona' 
                    : 'Fuera de zona'
                }
              </p>
            </div>
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
            salesPoints={assignedPoints}
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
            salesPoints={assignedPoints}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            showSearch={true}
          />
        </div>

        {/* Right Column - Map */}
        <div className="flex-1 relative">
          <MapComponent
            salesPoints={assignedPoints}
            salesZone={assignedZone}
            selectedPoint={selectedPoint}
            onPointSelect={setSelectedPoint}
            className="h-full"
            zoneColor={zoneColor}
          />

          {/* Desktop stats overlay */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border border-gray-700/50 shadow-lg">
              <p className="text-xs text-gray-400 mb-1">Zona Asignada</p>
              <p className="text-sm font-semibold text-white">{assignedZone.name}</p>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border border-gray-700/50 shadow-lg">
              <p className="text-xs text-gray-400 mb-1">Total Puntos</p>
              <p className="text-lg font-bold text-yellow-400">{assignedPoints.length}</p>
            </div>
            {/* Estado de ubicación */}
            <div className={`bg-gray-900/80 backdrop-blur-md rounded-lg p-3 border shadow-lg ${
              locationStatus.isInside === null 
                ? 'border-gray-700/50' 
                : locationStatus.isInside 
                  ? 'border-green-500/50' 
                  : 'border-red-500/50'
            }`}>
              <p className="text-xs text-gray-400 mb-1">Estado de Ubicación</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  locationStatus.isInside === null 
                    ? 'bg-gray-400' 
                    : locationStatus.isInside 
                      ? 'bg-green-400' 
                      : 'bg-red-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  locationStatus.isInside === null 
                    ? 'text-gray-400' 
                    : locationStatus.isInside 
                      ? 'text-green-400' 
                      : 'text-red-400'
                }`}>
                  {locationStatus.isInside === null 
                    ? 'Verificando ubicación...' 
                    : locationStatus.isInside 
                      ? 'Dentro de la zona' 
                      : 'Fuera de la zona'
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