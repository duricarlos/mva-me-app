# MVA-ME App - Sistema de Gestión de Vendedores

Una aplicación web completa para la gestión de vendedores y puntos de venta con **geolocalización en tiempo real**, construida con Next.js, Clerk para autenticación y Strapi como CMS.

## 🚀 Funcionalidades Principales

### 🗺️ **Sistema de Mapas Interactivos**

- **Visualización de zonas asignadas** con polígonos GeoJSON
- **Puntos de venta interactivos** con información detallada
- **Mapas responsive** optimizados para móvil y escritorio
- **Controles de navegación** personalizados
- **Marcadores dinámicos** con información en tiempo real

### 📍 **Geolocalización en Tiempo Real**

- **Solicitud automática de permisos** de ubicación del navegador
- **Verificación cada 5 segundos** si el vendedor está dentro de su zona
- **Algoritmo de geofencing** usando ray casting para polígonos complejos
- **Feedback visual en tiempo real**:
  - 🟢 **Verde**: Dentro de la zona asignada
  - 🔴 **Rojo**: Fuera de la zona asignada
  - 🟡 **Amarillo**: Verificando ubicación
- **Cambio de color dinámico** de la zona en el mapa
- **Indicadores de estado** con timestamps de última verificación
- **Manejo de errores** de geolocalización con mensajes informativos

### 👤 **Gestión de Vendedores**

- ✅ **Registro e inicio de sesión seguro** con Clerk
- ✅ **Dashboard personalizado** con información específica del vendedor
- ✅ **Perfil de vendedor** con datos personales y estado de activación
- ✅ **Asignación de zonas** y puntos de venta específicos
- ✅ **Control de acceso** basado en roles y permisos

### 🎯 **Puntos de Venta**

- ✅ **Lista detallada** de puntos asignados al vendedor
- ✅ **Información completa**: nombre, dirección, tipo, coordenadas
- ✅ **Clasificación por tipo**: Distribuidor, Ferretería, Depósito
- ✅ **Búsqueda y filtrado** de puntos (versión escritorio)
- ✅ **Selección interactiva** con sincronización mapa-lista

### 📱 **Interfaz de Usuario**

- ✅ **Diseño responsive** optimizado para móvil y escritorio
- ✅ **Tema oscuro** con gradientes y efectos visuales modernos
- ✅ **Animaciones fluidas** y transiciones suaves
- ✅ **Componentes reutilizables** con shadcn/ui
- ✅ **Estados de carga** y manejo de errores elegante

### 🔧 **Panel de Administración**

- ✅ **Gestión completa** desde panel Strapi
- ✅ **Creación y edición** de zonas de venta con coordenadas GeoJSON
- ✅ **Gestión de puntos de venta** con geolocalización
- ✅ **Control de activación** de vendedores
- ✅ **Vinculación automática** con cuentas de Clerk
- ✅ **API tokens** para acceso seguro a datos

### 🛡️ **Seguridad y Autenticación**

- ✅ **Autenticación segura** con Clerk
- ✅ **Protección de rutas** y API endpoints
- ✅ **Validación de permisos** por rol de usuario
- ✅ **Tokens seguros** para comunicación con Strapi
- ✅ **Manejo seguro** de datos de ubicación

## 📄 Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0** - ver el archivo [LICENSE.txt](LICENSE.txt) para más detalles.

### ⚖️ Resumen de la licencia GPL v3

- ✅ **Puedes**: Ver, usar, modificar y distribuir el código
- ✅ **Debes**: Proporcionar el código fuente y mantener la misma licencia GPL
- ✅ **Debes**: Dar crédito al autor original (Carlos Duri)
- ❌ **No puedes**: Crear versiones propietarias sin liberar el código fuente

### 📝 Atribución requerida

Si usas este código, debes incluir:

```text
MVA-ME App - Sistema de Gestión de Vendedores
Copyright (C) 2025 Carlos Duri

Este programa es software libre: puedes redistribuirlo y/o modificarlo
bajo los términos de la Licencia Pública General GNU publicada por
la Free Software Foundation, ya sea la versión 3 de la Licencia, o
(a tu elección) cualquier versión posterior.
```

### 🤝 Contribuciones

Las contribuciones son bienvenidas. Al contribuir, aceptas que tu código se licencie bajo GPL v3.

## Arquitectura del Sistema

### Roles de Usuario

- **Admin**: Acceso exclusivo al panel de Strapi. Gestiona datos y aprueba vendedores.
- **Vendedor**: Se registra y accede a la app Next.js vía Clerk para ver su información asignada.

### Flujo de Datos

1. **Registro**: Vendedor se registra en la app usando Clerk
2. **Configuración**: Admin crea perfil en Strapi y asigna zonas/puntos
3. **Vinculación**: Admin conecta cuentas usando `clerk_user_id`
4. **Sincronización**: Admin agrega `strapi_profile_id` a metadatos de Clerk
5. **Acceso**: Vendedor accede a sus datos a través de API protegida

## Tecnologías Utilizadas

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Autenticación**: Clerk
- **CMS**: Strapi
- **Mapas**: MapLibre GL con geolocalización en tiempo real
- **UI**: shadcn/ui components
- **Geolocalización**: Navigator Geolocation API
- **Algoritmos**: Ray casting para geofencing de polígonos

## Configuración del Proyecto

### 1. Clonar e instalar dependencias

```bash
git clone [repo-url]
cd mva-me-app
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local` y configura:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_publishable_key
CLERK_SECRET_KEY=tu_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=tu_strapi_api_token
```

### 3. Configurar Strapi

Consulta `STRAPI_SETUP.md` para la configuración completa de:

- Collection Types
- Permisos
- API Tokens

### 4. Ejecutar la aplicación

```bash
npm run dev
```

## Funcionalidades Principales

### Para Vendedores

- ✅ Registro e inicio de sesión seguro
- ✅ Dashboard personalizado con mapa interactivo
- ✅ **Geolocalización en tiempo real** con verificación de zona
- ✅ **Feedback visual** del estado de ubicación (dentro/fuera de zona)
- ✅ Visualización de zonas asignadas con **cambio de color dinámico**
- ✅ Lista de puntos de venta con detalles completos
- ✅ **Interfaz responsive** optimizada para móvil y escritorio
- ✅ **Indicadores de estado** con timestamps de verificación
- ✅ **Manejo de errores** de geolocalización con mensajes informativos

### Para Administradores

- ✅ Gestión completa desde panel Strapi
- ✅ Creación y asignación de zonas de venta
- ✅ Gestión de puntos de venta
- ✅ Control de activación de vendedores
- ✅ Vinculación con cuentas de Clerk

## 🌍 Sistema de Geolocalización

### Características Técnicas

- **Algoritmo de Geofencing**: Implementación de ray casting para verificar si un punto está dentro de un polígono GeoJSON
- **Precisión**: Alta precisión con `enableHighAccuracy: true`
- **Frecuencia**: Verificación cada 5 segundos
- **Timeout**: 10 segundos máximo para obtener ubicación
- **Cache**: Máximo 5 segundos de antigüedad para datos de ubicación

### Estados de Ubicación

| Estado | Color | Descripción |
|--------|--------|-------------|
| 🟡 Verificando | Amarillo (`#FFC300`) | Solicitando permisos o obteniendo ubicación |
| 🟢 En zona | Verde (`#22C55E`) | Vendedor dentro de su zona asignada |
| 🔴 Fuera de zona | Rojo (`#EF4444`) | Vendedor fuera de su zona asignada |

### Manejo de Errores

- **Permisos denegados**: Mensaje informativo al usuario
- **Timeout de ubicación**: Reintento automático en próxima verificación
- **Precisión baja**: Manejo automático con configuración optimizada
- **Sin conexión**: Mantiene último estado conocido

## 🔌 API Endpoints

### `GET /api/seller/profile`

Obtiene el perfil completo del vendedor autenticado, incluyendo:

- Información del perfil
- Zonas de venta asignadas
- Puntos de venta asignados

**Autenticación**: Requerida (Clerk)

### `GET /api/seller/profile`

Obtiene el perfil completo del vendedor autenticado, incluyendo:

- Información del perfil
- Zonas de venta asignadas
- Puntos de venta asignados

**Autenticación**: Requerida (Clerk)

## Desarrollo

### Scripts disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar build de producción
npm run lint         # Verificar código con ESLint
```

### Estructura de datos

Ver `lib/types.ts` para todos los tipos TypeScript utilizados.

Los datos de ejemplo están en `lib/data.ts` y pueden usarse para testing inicial.

## Deployment

1. **Strapi**: Deploar primero en servicio como Railway, Heroku, etc.
2. **Next.js**: Deploar en Vercel, Netlify o similar
3. **Variables**: Configurar variables de entorno en producción
4. **DNS**: Actualizar URLs en configuración de Clerk

## 📋 Resumen de Funcionalidades Implementadas

### ✅ **Completadas y Funcionales**

#### 🗺️ **Sistema de Mapas**

- Mapas interactivos con MapLibre GL
- Visualización de zonas de venta (polígonos GeoJSON)
- Marcadores de puntos de venta interactivos
- Controles de navegación personalizados
- Diseño responsive para móvil y escritorio

#### 📍 **Sistema de Geolocalización**

- Solicitud automática de permisos de ubicación
- Verificación cada 5 segundos de ubicación del vendedor
- Algoritmo de geofencing con ray casting
- Cambio de color dinámico de zonas según ubicación
- Indicadores visuales de estado (Verde/Rojo/Amarillo)
- Timestamps de última verificación
- Manejo robusto de errores de geolocalización

#### 👤 **Autenticación y Perfiles**

- Sistema de autenticación seguro con Clerk
- Dashboard personalizado por vendedor
- Gestión de perfiles con Strapi
- Control de acceso basado en roles
- Vinculación automática Clerk-Strapi

#### 🎯 **Gestión de Puntos de Venta**

- Lista detallada de puntos asignados
- Información completa (nombre, dirección, tipo, coordenadas)
- Clasificación por tipo (Distribuidor, Ferretería, Depósito)
- Sincronización entre mapa y lista
- Búsqueda y filtrado (versión escritorio)

#### 🎨 **Interfaz de Usuario**

- Diseño moderno con tema oscuro
- Componentes reutilizables con shadcn/ui
- Animaciones y transiciones fluidas
- Estados de carga elegantes
- Responsive design optimizado

#### 🔧 **Administración**

- Gestión completa desde Strapi
- Creación y edición de zonas con GeoJSON
- Gestión de puntos de venta
- Control de activación de vendedores
- API tokens seguros

### 🚀 **Tecnologías Core**

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Autenticación**: Clerk
- **Backend**: Strapi CMS
- **Mapas**: MapLibre GL
- **Geolocalización**: Navigator Geolocation API
- **UI**: shadcn/ui components

## 📞 Soporte

Para problemas o preguntas, consulta:

1. `STRAPI_SETUP.md` para configuración de Strapi
2. Documentación de [Clerk](https://clerk.com/docs)
3. Documentación de [Next.js](https://nextjs.org/docs)
