# Amanwal Backend

Backend para la plataforma de alojamiento de cabañas.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

## Configuración de Base de Datos

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Build

```bash
npm run build
npm start
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere autenticación)

### Cabins
- `GET /api/cabins` - Obtener todas las cabañas
- `GET /api/cabins/:id` - Obtener cabaña por ID
- `POST /api/cabins` - Crear cabaña (requiere autenticación)
- `PUT /api/cabins/:id` - Actualizar cabaña (requiere autenticación)
- `DELETE /api/cabins/:id` - Eliminar cabaña (requiere autenticación)

### Bookings
- `POST /api/bookings` - Crear reserva (requiere autenticación)
- `GET /api/bookings` - Obtener mis reservas (requiere autenticación)
- `PATCH /api/bookings/:id/cancel` - Cancelar reserva (requiere autenticación)

### Reviews
- `POST /api/reviews` - Crear reseña (requiere autenticación)
- `GET /api/reviews/cabin/:cabinId` - Obtener reseñas de una cabaña

## Estructura del Proyecto

```
src/
├── controllers/     # Controladores de rutas
├── routes/          # Definición de rutas
├── middleware/      # Middlewares personalizados
├── __tests__/       # Tests unitarios
└── server.ts        # Archivo principal
```
