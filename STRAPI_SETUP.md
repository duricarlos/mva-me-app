# Estructura de Datos de Strapi

Este documento describe la configuración necesaria en Strapi para que funcione la aplicación de vendedores.

## Collection Types requeridos en Strapi

### 1. Seller Profiles

**Nombre de colección:** `seller-profiles`

**Campos:**
- `clerk_user_id` (Text, Required, Unique) - ID del usuario de Clerk
- `name` (Text, Required) - Nombre completo del vendedor
- `email` (Email, Required) - Email del vendedor
- `active` (Boolean, Default: true) - Estado activo/inactivo del perfil
- `sales_zones` (Relation, Many-to-Many) - Relación con Sales Zones
- `sales_points` (Relation, Many-to-Many) - Relación con Sales Points

### 2. Sales Zones

**Nombre de colección:** `sales-zones`

**Campos:**
- `name` (Text, Required) - Nombre de la zona
- `coordinates` (JSON, Required) - Coordenadas del polígono en formato GeoJSON
- `description` (Text) - Descripción opcional de la zona
- `seller_profiles` (Relation, Many-to-Many) - Relación con Seller Profiles

### 3. Sales Points

**Nombre de colección:** `sales-points`

**Campos:**
- `name` (Text, Required) - Nombre del punto de venta
- `address` (Text, Required) - Dirección completa
- `coordinates` (JSON, Required) - Coordenadas [longitude, latitude]
- `type` (Enumeration, Required) - Opciones: distribuidor, ferreteria, deposito
- `description` (Text) - Descripción opcional
- `seller_profiles` (Relation, Many-to-Many) - Relación con Seller Profiles

## Configuración de Permisos

### API Tokens
Crear un API Token en Strapi con permisos de lectura para:
- seller-profiles
- sales-zones
- sales-points

### Roles y Permisos para Public
- **seller-profiles**: Find, FindOne (con filtros)
- **sales-zones**: Find, FindOne
- **sales-points**: Find, FindOne

## Flujo de trabajo para el Admin

1. **Crear Zones y Points**
   - El admin primero crea las Sales Zones y Sales Points en Strapi
   - Puede usar las coordenadas de ejemplo que están en `lib/data.ts`

2. **Crear Seller Profile**
   - Cuando un nuevo vendedor se registra en la app (vía Clerk), el admin:
   - Va a Strapi y crea un nuevo Seller Profile
   - Asigna las zonas y puntos correspondientes
   - Copia el userId de Clerk y lo pega en `clerk_user_id`

3. **Sincronizar metadatos (Opcional pero recomendado)**
   - En el dashboard de Clerk, buscar al usuario por email
   - Editar Public Metadata y agregar: `{ "strapi_profile_id": 27 }`
   - Esto optimiza las consultas

## Ejemplo de datos para testing

Puedes usar los datos de `lib/data.ts` para crear contenido de prueba en Strapi:
- `salesZones` contiene 5 zonas con coordenadas reales
- `mockSalesPoints` contiene 5 puntos de venta de ejemplo

## URLs de API

Las APIs de Strapi estarán disponibles en:
- `GET /api/seller-profiles`
- `GET /api/sales-zones`
- `GET /api/sales-points`

## Variables de entorno requeridas

```env
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=tu_token_aqui
```
