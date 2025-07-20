export interface SalesPoint {
  id: string
  name: string
  address: string
  coordinates: [number, number] // [longitude, latitude]
  type: 'distribuidor' | 'ferreteria' | 'deposito'
}

export interface SalesZone {
  id: string
  name: string
  coordinates: [number, number][][] // GeoJSON polygon coordinates
}

export interface User {
  id: string
  username: string
  name: string
  assignedZone: SalesZone
  assignedPoints: SalesPoint[]
}

// Tipos para la integración con Strapi
export interface SellerProfile {
  id: number
  clerk_user_id: string
  name: string
  email: string
  active: boolean
  sales_zones: StrapiSalesZone[]
  sales_points: StrapiSalesPoint[]
  createdAt: string
  updatedAt: string
}

export interface StrapiSalesZone {
  id: number
  name: string
  coordinates: [number, number][][]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface StrapiSalesPoint {
  id: number
  name: string
  address: string
  coordinates: [number, number]
  type: 'distribuidor' | 'ferreteria' | 'deposito'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface StrapiResponse<T> {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// Tipos para los metadatos de Clerk
export interface ClerkUserMetadata {
  strapi_profile_id?: number
}
