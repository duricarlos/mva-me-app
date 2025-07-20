'use client'

import { useState } from 'react'
import type { SalesPoint } from '@/lib/types'
import { Input } from './ui/input'

interface SalesPointsListProps {
  salesPoints: SalesPoint[]
  selectedPoint?: SalesPoint | null
  onPointSelect?: (point: SalesPoint) => void
  showSearch?: boolean
}

const typeLabels = {
  distribuidor: 'Distribuidor',
  ferreteria: 'Ferretería',
  deposito: 'Depósito',
}

const typeColors = {
  distribuidor: 'bg-blue-600 text-blue-100',
  ferreteria: 'bg-green-600 text-green-100',
  deposito: 'bg-purple-600 text-purple-100',
}

export function SalesPointsList({ salesPoints, selectedPoint, onPointSelect, showSearch = false }: SalesPointsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPoints = salesPoints.filter((point) => point.name.toLowerCase().includes(searchTerm.toLowerCase()) || point.address.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className='flex flex-col h-full'>
      {showSearch && (
        <div className='p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm'>
          <Input type='text' placeholder='Buscar punto de venta...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-full' />
          <p className='text-xs text-gray-400 mt-2'>
            {filteredPoints.length} de {salesPoints.length} puntos
          </p>
        </div>
      )}

      <div className='flex-1 overflow-y-auto'>
        <div className='p-4 space-y-3'>
          {filteredPoints.map((point, index) => (
            <div
              key={point.id}
              onClick={() => onPointSelect?.(point)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${selectedPoint?.id === point.id ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20' : 'border-gray-600 bg-gray-800/80 backdrop-blur-sm hover:border-gray-500 hover:bg-gray-750/80 hover:shadow-md'}`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className='flex items-start justify-between mb-3'>
                <h3 className='font-semibold text-white text-sm leading-tight pr-2'>{point.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${typeColors[point.type]} shadow-sm`}>{typeLabels[point.type]}</span>
              </div>
              <p className='text-gray-400 text-sm leading-relaxed'>{point.address}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${point.coordinates[1]},${point.coordinates[0]}`} target='_blank' rel='noopener noreferrer' className='text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline'>
                📍 Abrir en Google Maps
              </a>

              {selectedPoint?.id === point.id && (
                <div className='mt-3 pt-3 border-t border-yellow-400/20'>
                  <div className='flex items-center text-yellow-400 text-xs'>
                    <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' />
                    </svg>
                    Punto seleccionado
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredPoints.length === 0 && (
            <div className='text-center py-8'>
              <div className='text-gray-500 mb-2'>
                <svg className='w-12 h-12 mx-auto mb-3 opacity-50' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' />
                </svg>
              </div>
              <p className='text-gray-400 text-sm'>No se encontraron puntos de venta</p>
              <p className='text-gray-500 text-xs mt-1'>Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
