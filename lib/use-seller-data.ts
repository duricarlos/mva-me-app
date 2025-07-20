import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import type { SalesZone, SalesPoint } from './types'

interface SellerData {
  profile: {
    id: number
    name: string
    email: string
    active: boolean
  }
  salesZones: SalesZone[]
  salesPoints: SalesPoint[]
}

interface UseSellerDataReturn {
  data: SellerData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSellerData(): UseSellerDataReturn {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSellerData = useCallback(async () => {
    if (!user || !isLoaded) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/seller/profile')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Error al obtener datos')
      }

      const sellerData = await response.json()
      setData(sellerData)
    } catch (err) {
      console.error('Error fetching seller data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      fetchSellerData()
    }
  }, [isLoaded, fetchSellerData])

  return {
    data,
    loading,
    error,
    refetch: fetchSellerData
  }
}
