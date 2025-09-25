"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { SalesPoint, SalesZone } from "@/lib/types"

interface MapComponentProps {
  assignedPoints: SalesPoint[]
  allPoints: SalesPoint[]
  assignedZones: SalesZone[]
  allZones: SalesZone[]
  selectedPoint?: SalesPoint | null
  onPointSelect?: (point: SalesPoint) => void
  className?: string
  zoneColor?: string // Color para las zonas asignadas
}

export function MapComponent({
  assignedPoints,
  allPoints,
  assignedZones,
  allZones,
  selectedPoint,
  onPointSelect,
  className = "",
  zoneColor = "#FFC300",
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    // Inicializar mapa con configuración optimizada para móvil
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://api.maptiler.com/maps/streets-v2/style.json?key=2oGDT5BjbYZQmRFvHaL1",
      center: [-80.843, 35.227], // Charlotte central coordinates
      zoom: 12,
      minZoom: 8,
      maxZoom: 18,
      // Configuración de interacción táctil
      touchZoomRotate: true,
      touchPitch: false,
      dragRotate: false,
      pitchWithRotate: false,
      dragPan: true,
      keyboard: false,
    })

    // Configurar controles de navegación
    map.current.addControl(new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true,
      visualizePitch: false
    }), 'top-right')

    map.current.on("load", () => {
      setMapLoaded(true)
      console.log("Mapa cargado correctamente")
      
      // Exponer la instancia del mapa globalmente para permitir cambios externos
      if (typeof window !== 'undefined') {
        (window as any).mapInstance = map.current; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    })

    map.current.on("error", (e) => {
      console.error("Error en el mapa:", e)
    })

    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove())
        map.current.remove()
      }
    }
  }, [])

  // Agregar todas las zonas de ventas
  useEffect(() => {
    if (!map.current || !mapLoaded || !allZones.length) return

    // Limpiar fuentes y capas existentes de zonas
    if (map.current.getLayer('assigned-zones-fill')) map.current.removeLayer('assigned-zones-fill')
    if (map.current.getLayer('assigned-zones-line')) map.current.removeLayer('assigned-zones-line')
    if (map.current.getLayer('unassigned-zones-fill')) map.current.removeLayer('unassigned-zones-fill')
    if (map.current.getLayer('unassigned-zones-line')) map.current.removeLayer('unassigned-zones-line')
    if (map.current.getSource('assigned-zones')) map.current.removeSource('assigned-zones')
    if (map.current.getSource('unassigned-zones')) map.current.removeSource('unassigned-zones')

    // Crear IDs de zonas asignadas para comparación
    const assignedZoneIds = new Set(assignedZones.map(zone => zone.id))
    
    // Separar zonas asignadas y no asignadas
    const unassignedZones = allZones.filter(zone => !assignedZoneIds.has(zone.id))

    // Agregar zonas asignadas (en color)
    if (assignedZones.length > 0) {
      map.current.addSource("assigned-zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: assignedZones.map(zone => ({
            type: "Feature",
            properties: { id: zone.id, name: zone.name },
            geometry: {
              type: "Polygon",
              coordinates: zone.coordinates,
            },
          })),
        },
      })

      // Capa de relleno para zonas asignadas
      map.current.addLayer({
        id: "assigned-zones-fill",
        type: "fill",
        source: "assigned-zones",
        paint: {
          "fill-color": zoneColor,
          "fill-opacity": 0.2,
        },
      })

      // Capa de borde para zonas asignadas
      map.current.addLayer({
        id: "assigned-zones-line",
        type: "line", 
        source: "assigned-zones",
        paint: {
          "line-color": zoneColor,
          "line-width": 2,
        },
      })
    }

    // Agregar zonas no asignadas (en gris)
    if (unassignedZones.length > 0) {
      map.current.addSource("unassigned-zones", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: unassignedZones.map(zone => ({
            type: "Feature",
            properties: { id: zone.id, name: zone.name },
            geometry: {
              type: "Polygon",
              coordinates: zone.coordinates,
            },
          })),
        },
      })

      // Capa de relleno para zonas no asignadas (gris)
      map.current.addLayer({
        id: "unassigned-zones-fill",
        type: "fill",
        source: "unassigned-zones",
        paint: {
          "fill-color": "#6B7280", // Gris
          "fill-opacity": 0.15,
        },
      })

      // Capa de borde para zonas no asignadas (gris)
      map.current.addLayer({
        id: "unassigned-zones-line",
        type: "line",
        source: "unassigned-zones", 
        paint: {
          "line-color": "#6B7280", // Gris
          "line-width": 1,
          "line-dasharray": [2, 2], // Línea punteada para distinguir
        },
      })
    }
  }, [mapLoaded, assignedZones, allZones, zoneColor])

  // Efecto para actualizar el color de las zonas asignadas cuando cambie
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    if (map.current.getLayer('assigned-zones-fill')) {
      map.current.setPaintProperty('assigned-zones-fill', 'fill-color', zoneColor);
    }
    if (map.current.getLayer('assigned-zones-line')) {
      map.current.setPaintProperty('assigned-zones-line', 'line-color', zoneColor);
    }
  }, [zoneColor, mapLoaded]);

  // Agregar puntos de venta (asignados y no asignados)
  useEffect(() => {
    if (!map.current || !mapLoaded || !allPoints.length) return

    console.log("Agregando marcadores:", allPoints.length, "puntos totales,", assignedPoints.length, "asignados")

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Crear IDs de puntos asignados para comparación
    const assignedPointIds = new Set(assignedPoints.map(point => point.id))

    // Agregar marcadores para todos los puntos
    allPoints.forEach((point) => {
      const isAssigned = assignedPointIds.has(point.id)
      // Crear elemento del marcador
      const el = document.createElement("div")
      el.className = "sales-point-marker"
      
      // Estilos diferenciados para puntos asignados vs no asignados
      const backgroundColor = isAssigned ? "#FFC300" : "#6B7280" // Amarillo para asignados, gris para no asignados
      const borderColor = isAssigned ? "#0D1B2A" : "#4B5563"
      const iconColor = isAssigned ? "#0D1B2A" : "#9CA3AF"
      
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: ${backgroundColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        cursor: pointer;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        position: relative;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        touch-action: manipulation;
        opacity: ${isAssigned ? '1' : '0.7'};
      `

      // Agregar icono interno
      const icon = document.createElement("div")
      icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${iconColor}"/>
        </svg>
      `
      el.appendChild(icon)

      // Crear popup
      const popup = new maplibregl.Popup({
        offset: 35,
        className: "sales-point-popup",
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="color: #0D1B2A; font-weight: 500; min-width: 200px;">
          <div style="font-size: 14px; margin-bottom: 8px; font-weight: 600;">${point.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${point.address}</div>
          <div style="font-size: 11px; color: #888; margin-bottom: 8px; text-transform: capitalize; background: #f0f0f0; padding: 2px 6px; border-radius: 12px; display: inline-block;">${point.type}</div>
          ${isAssigned ? '' : '<div style="font-size: 11px; color: #dc2626; margin-bottom: 8px; font-weight: 600; background: #fee2e2; padding: 2px 6px; border-radius: 12px; display: inline-block;">⚠️ No asignado a tu zona</div>'}
          <div style="margin-top: 8px;">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${point.coordinates[1]},${point.coordinates[0]}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #2563eb; text-decoration: none; font-size: 12px; font-weight: 500;"
            >
              📍 Abrir en Google Maps
            </a>
          </div>
        </div>
      `)

      // Crear marcador
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(point.coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      // Eventos de interacción
      const handleMouseEnter = () => {
        // En lugar de transform, usamos box-shadow y border para el efecto hover
        el.style.boxShadow = "0 4px 16px rgba(255, 195, 0, 0.6), 0 0 0 2px rgba(255, 195, 0, 0.3)"
        el.style.borderColor = "#FFD60A"
        el.style.zIndex = "1001"
      }

      const handleMouseLeave = () => {
        // Restaurar estilos originales
        el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)"
        el.style.borderColor = "#0D1B2A"
        el.style.zIndex = "1000"
      }

      const handleClick = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        // Llamar callback de selección
        onPointSelect?.(point)
        // Mostrar/ocultar popup
        marker.togglePopup()
      }

      // Agregar event listeners
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
      el.addEventListener("click", handleClick)
      
      // Para móvil, usar touchend en lugar de touchstart
      el.addEventListener("touchend", (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Efecto visual temporal sin transform
        const originalBoxShadow = el.style.boxShadow
        const originalBorderColor = el.style.borderColor
        
        el.style.boxShadow = "0 4px 16px rgba(255, 195, 0, 0.8)"
        el.style.borderColor = "#FFD60A"
        
        setTimeout(() => {
          el.style.boxShadow = originalBoxShadow
          el.style.borderColor = originalBorderColor
        }, 150)
        
        onPointSelect?.(point)
        marker.togglePopup()
      }, { passive: false })

      // Guardar referencia del marcador
      markers.current.push(marker)
    })
  }, [mapLoaded, allPoints, assignedPoints, onPointSelect])

  // Centrar en punto seleccionado y resaltarlo
  useEffect(() => {
    if (!map.current || !selectedPoint || !markers.current.length) return

    // Encontrar el marcador correspondiente
    const targetMarker = markers.current.find((marker, index) => {
      const point = allPoints[index]
      return point && point.id === selectedPoint.id
    })

    if (targetMarker) {
      // Resaltar el marcador seleccionado
      const markerElement = targetMarker.getElement()
      const allMarkers = markers.current.map(m => m.getElement())
      
      // Resetear todos los marcadores (sin usar transform)
      allMarkers.forEach(el => {
        el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)"
        el.style.borderColor = "#0D1B2A"
        el.style.borderWidth = "3px"
        el.style.zIndex = "1000"
        el.style.filter = "none"
      })
      
      // Resaltar el marcador seleccionado (sin usar transform)
      markerElement.style.boxShadow = "0 6px 20px rgba(255, 195, 0, 0.8), 0 0 0 3px rgba(255, 195, 0, 0.4)"
      markerElement.style.borderColor = "#FFD60A"
      markerElement.style.borderWidth = "4px"
      markerElement.style.zIndex = "1002"
      markerElement.style.filter = "brightness(1.1)"
    }

    // Centrar el mapa en el punto seleccionado
    map.current.flyTo({
      center: selectedPoint.coordinates,
      zoom: Math.max(map.current.getZoom(), 15),
      duration: 1000,
    })
  }, [selectedPoint, allPoints])

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      <style jsx global>{`
        .sales-point-popup .maplibregl-popup-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          padding: 12px 16px;
          max-width: 280px;
          border: 1px solid #e5e7eb;
        }
        .sales-point-popup .maplibregl-popup-tip {
          border-top-color: white;
        }
        .sales-point-popup .maplibregl-popup-close-button {
          color: #6b7280;
          font-size: 18px;
          font-weight: bold;
          right: 8px;
          top: 8px;
        }
        .sales-point-popup .maplibregl-popup-close-button:hover {
          color: #374151;
        }
        
        /* Estilos específicos para móvil */
        @media (max-width: 768px) {
          .sales-point-marker {
            width: 32px !important;
            height: 32px !important;
            border-width: 3px !important;
          }
          
          .sales-point-popup .maplibregl-popup-content {
            max-width: 250px;
            font-size: 14px;
          }
          
          /* Mejorar la interacción táctil */
          .sales-point-marker {
            -webkit-tap-highlight-color: rgba(255, 195, 0, 0.3);
            tap-highlight-color: rgba(255, 195, 0, 0.3);
          }
        }
        
        /* Asegurar que los marcadores estén por encima de otros elementos */
        .maplibregl-marker {
          z-index: 1000 !important;
          will-change: transform;
        }
        
        .sales-point-marker {
          pointer-events: auto !important;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }
        
        /* Mejorar visibilidad del popup en móvil */
        @media (max-width: 768px) {
          .maplibregl-popup {
            max-width: 90vw !important;
          }
          
          .sales-point-popup .maplibregl-popup-content {
            padding: 16px !important;
            font-size: 16px !important;
            line-height: 1.4;
          }
          
          .sales-point-popup .maplibregl-popup-close-button {
            font-size: 20px !important;
            right: 12px !important;
            top: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}
