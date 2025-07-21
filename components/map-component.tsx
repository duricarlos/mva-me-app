"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { SalesPoint, SalesZone } from "@/lib/types"

interface MapComponentProps {
  salesPoints: SalesPoint[]
  salesZone: SalesZone
  selectedPoint?: SalesPoint | null
  onPointSelect?: (point: SalesPoint) => void
  className?: string
  zoneColor?: string // Nuevo prop para el color de la zona
}

export function MapComponent({
  salesPoints,
  salesZone,
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

  // Agregar zona de ventas
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Agregar fuente de la zona
    if (!map.current.getSource("sales-zone")) {
      map.current.addSource("sales-zone", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: salesZone.coordinates,
            // coordinates: salesZonesMock.zone1.coordinates, // Usar mock para pruebas
          },
        },
      })

      // Agregar capa de relleno
      map.current.addLayer({
        id: "sales-zone-fill",
        type: "fill",
        source: "sales-zone",
        paint: {
          "fill-color": zoneColor,
          "fill-opacity": 0.2,
        },
      })

      // Agregar capa de borde
      map.current.addLayer({
        id: "sales-zone-line",
        type: "line",
        source: "sales-zone",
        paint: {
          "line-color": zoneColor,
          "line-width": 2,
        },
      })
    }
  }, [mapLoaded, salesZone, zoneColor])

  // Efecto para actualizar el color de la zona cuando cambie
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    if (map.current.getLayer('sales-zone-fill')) {
      map.current.setPaintProperty('sales-zone-fill', 'fill-color', zoneColor);
    }
    if (map.current.getLayer('sales-zone-line')) {
      map.current.setPaintProperty('sales-zone-line', 'line-color', zoneColor);
    }
  }, [zoneColor, mapLoaded]);

  // Agregar puntos de venta
  useEffect(() => {
    if (!map.current || !mapLoaded || !salesPoints.length) return

    console.log("Agregando marcadores:", salesPoints.length, "puntos")

    // Limpiar marcadores existentes
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Agregar nuevos marcadores
    salesPoints.forEach((point) => {
      // Crear elemento del marcador
      const el = document.createElement("div")
      el.className = "sales-point-marker"
      
      // Estilos inline más específicos para móvil
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background-color: #FFC300;
        border: 3px solid #0D1B2A;
        border-radius: 50%;
        cursor: pointer;
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
        position: relative;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        touch-action: manipulation;
      `

      // Agregar icono interno
      const icon = document.createElement("div")
      icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#0D1B2A"/>
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
  }, [mapLoaded, salesPoints, onPointSelect])

  // Centrar en punto seleccionado y resaltarlo
  useEffect(() => {
    if (!map.current || !selectedPoint || !markers.current.length) return

    // Encontrar el marcador correspondiente
    const targetMarker = markers.current.find((marker, index) => {
      const point = salesPoints[index]
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
  }, [selectedPoint, salesPoints])

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
