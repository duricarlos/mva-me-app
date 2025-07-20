import axios from 'axios'
import type { 
  SellerProfile, 
  StrapiResponse, 
  StrapiSalesZone, 
  StrapiSalesPoint 
} from './types'

const strapiApi = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: {
    'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

export class StrapiService {
  // Obtener perfil de vendedor por ID
  static async getSellerProfileById(profileId: number): Promise<SellerProfile | null> {
    try {
      const response = await strapiApi.get<StrapiResponse<SellerProfile>>(
        `/api/seller-profiles/${profileId}?populate[sales_zones][populate]=*&populate[sales_points][populate]=*`
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching seller profile:', error)
      return null
    }
  }

  // Obtener perfil de vendedor por clerk_user_id
  static async getSellerProfileByClerkId(clerkUserId: string): Promise<SellerProfile | null> {
    try {
      const response = await strapiApi.get<StrapiResponse<SellerProfile[]>>(
        `/api/seller-profiles?filters[clerk_user_id][$eq]=${clerkUserId}&populate[sales_zones][populate]=*&populate[sales_points][populate]=*`
      )
      
      if (response.data.data.length > 0) {
        return response.data.data[0]
      }
      return null
    } catch (error) {
      console.error('Error fetching seller profile by Clerk ID:', error)
      return null
    }
  }

  // Crear un nuevo perfil de vendedor
  static async createSellerProfile(data: {
    clerk_user_id: string
    name: string
    email: string
    active?: boolean
  }): Promise<SellerProfile | null> {
    try {
      const response = await strapiApi.post<StrapiResponse<SellerProfile>>(
        '/api/seller-profiles',
        {
          data: {
            ...data,
            active: data.active ?? true
          }
        }
      )
      return response.data.data
    } catch (error) {
      console.error('Error creating seller profile:', error)
      return null
    }
  }

  // Actualizar perfil de vendedor
  static async updateSellerProfile(
    profileId: number, 
    data: Partial<{
      name: string
      email: string
      active: boolean
      sales_zones: number[]
      sales_points: number[]
    }>
  ): Promise<SellerProfile | null> {
    try {
      const response = await strapiApi.put<StrapiResponse<SellerProfile>>(
        `/api/seller-profiles/${profileId}`,
        { data }
      )
      return response.data.data
    } catch (error) {
      console.error('Error updating seller profile:', error)
      return null
    }
  }

  // Obtener todas las zonas de venta
  static async getAllSalesZones(): Promise<StrapiSalesZone[]> {
    try {
      const response = await strapiApi.get<StrapiResponse<StrapiSalesZone[]>>(
        '/api/sales-zones'
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching sales zones:', error)
      return []
    }
  }

  // Obtener todos los puntos de venta
  static async getAllSalesPoints(): Promise<StrapiSalesPoint[]> {
    try {
      const response = await strapiApi.get<StrapiResponse<StrapiSalesPoint[]>>(
        '/api/sales-points'
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching sales points:', error)
      return []
    }
  }
}

// Funciones helper para transformar datos de Strapi a formato local
export function transformStrapiSalesZone(strapiZone: StrapiSalesZone) {
  return {
    id: strapiZone.id.toString(),
    name: strapiZone.name,
    coordinates: strapiZone.coordinates
  }
}

export function transformStrapiSalesPoint(strapiPoint: StrapiSalesPoint) {
  return {
    id: strapiPoint.id.toString(),
    name: strapiPoint.name,
    address: strapiPoint.address,
    coordinates: strapiPoint.coordinates,
    type: strapiPoint.type
  }
}
