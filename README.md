# MVA-ME App - Sistema de Gestión de Vendedores

Una aplicación web completa para la gestión de vendedores y puntos de venta, construida con Next.js, Clerk para autenticación y Strapi como CMS.

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
- **Mapas**: MapLibre GL
- **UI**: shadcn/ui components

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
- ✅ Visualización de zonas asignadas
- ✅ Lista de puntos de venta con detalles
- ✅ Interfaz responsive (móvil y escritorio)

### Para Administradores

- ✅ Gestión completa desde panel Strapi
- ✅ Creación y asignación de zonas de venta
- ✅ Gestión de puntos de venta
- ✅ Control de activación de vendedores
- ✅ Vinculación con cuentas de Clerk

## API Endpoints

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

## Soporte

Para problemas o preguntas, consulta:

1. `STRAPI_SETUP.md` para configuración de Strapi
2. Documentación de [Clerk](https://clerk.com/docs)
3. Documentación de [Next.js](https://nextjs.org/docs)
