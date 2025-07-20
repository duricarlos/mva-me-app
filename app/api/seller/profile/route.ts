import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { StrapiService, transformStrapiSalesZone, transformStrapiSalesPoint } from '@/lib/strapi-service'
import type { ClerkUserMetadata } from '@/lib/types'

export async function GET() {
  try {
    // Obtener el usuario actual de Clerk
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Obtener el strapi_profile_id de los metadatos públicos del usuario
    const metadata = user.publicMetadata as ClerkUserMetadata
    const strapiProfileId = metadata.strapi_profile_id
    console.log({
        strapiProfileId,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress
    })

    if (!strapiProfileId) {
      // Si no hay profile_id en metadatos, intentar buscar por clerk_user_id
      const profile = await StrapiService.getSellerProfileByClerkId(user.id)
      
      if (!profile) {
        return NextResponse.json(
          { 
            error: 'Perfil de vendedor no encontrado',
            message: 'Contacte al administrador para que configure su perfil'
          },
          { status: 404 }
        )
      }

      // Transformar datos para respuesta
      const salesZones = profile.sales_zones.map(transformStrapiSalesZone)
      const salesPoints = profile.sales_points.map(transformStrapiSalesPoint)

      return NextResponse.json({
        profile: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          active: profile.active
        },
        salesZones,
        salesPoints
      })
    }

    // Obtener perfil usando el ID de los metadatos
    const profile = await StrapiService.getSellerProfileById(strapiProfileId)
    console.log('Profile fetched:', profile)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil de vendedor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el clerk_user_id coincida con el usuario actual
    if (profile.clerk_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      )
    }

    // Verificar que el perfil esté activo
    if (!profile.active) {
      return NextResponse.json(
        { 
          error: 'Perfil inactivo',
          message: 'Su perfil está desactivado. Contacte al administrador.'
        },
        { status: 403 }
      )
    }

    // Transformar datos para respuesta
    const salesZones = profile.sales_zones.map(transformStrapiSalesZone)
    const salesPoints = profile.sales_points.map(transformStrapiSalesPoint)

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        active: profile.active
      },
      salesZones,
      salesPoints
    })

  } catch (error) {
    console.error('Error en API de perfil del vendedor:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
