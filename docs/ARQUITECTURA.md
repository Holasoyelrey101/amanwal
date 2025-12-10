# 🏠 AMANWAL - Estructura del Proyecto

## 📁 Estructura de Carpetas

```
amanwal/
│
├── backend/                          # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/              # Lógica de negocio
│   │   │   ├── auth.controller.ts    # Autenticación
│   │   │   ├── cabin.controller.ts   # Gestión de cabañas
│   │   │   ├── booking.controller.ts # Reservas
│   │   │   └── review.controller.ts  # Reseñas
│   │   ├── routes/                   # Definición de rutas API
│   │   │   ├── auth.routes.ts
│   │   │   ├── cabin.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── review.routes.ts
│   │   ├── middleware/               # Middlewares personalizados
│   │   │   └── auth.middleware.ts    # Validación de JWT
│   │   ├── __tests__/                # Tests unitarios
│   │   │   └── auth.test.ts
│   │   └── server.ts                 # Punto de entrada
│   ├── prisma/
│   │   └── schema.prisma             # Esquema de BD con Prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .env.example
│   └── README.md
│
├── frontend/                         # Cliente React
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   └── Navbar.tsx            # Navegación
│   │   ├── pages/                    # Páginas de la app
│   │   │   ├── Home.tsx              # Página principal
│   │   │   ├── Login.tsx             # Autenticación
│   │   │   ├── Register.tsx          # Registro
│   │   │   ├── CabinList.tsx         # Listado de cabañas
│   │   │   └── CabinDetail.tsx       # Detalle de cabaña
│   │   ├── api/                      # Cliente HTTP
│   │   │   ├── client.ts             # Configuración axios
│   │   │   └── index.ts              # Endpoints API
│   │   ├── context/                  # Context API
│   │   │   └── AuthContext.tsx       # Contexto de autenticación
│   │   ├── App.tsx                   # Componente raíz
│   │   ├── main.tsx                  # Punto de entrada
│   │   └── App.css                   # Estilos globales
│   ├── public/                       # Activos estáticos
│   ├── index.html                    # HTML principal
│   ├── vite.config.ts                # Configuración Vite
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── README.md                         # Documentación principal
├── SETUP.md                          # Guía de instalación detallada
├── .dev-guide.md                     # Guía de desarrollo
├── package.json                      # Monorepo config
├── start.sh                          # Script inicio (macOS/Linux)
└── start.bat                         # Script inicio (Windows)
```

## 🛠️ Tecnologías

### Backend Stack
```
┌─────────────────────┐
│   Frontend (React)  │
└──────────┬──────────┘
           │ API REST (HTTP)
           ▼
┌──────────────────────────────┐
│   Backend (Express.js)       │
│   ├─ Controllers             │
│   ├─ Routes                  │
│   └─ Middleware (JWT)        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Prisma ORM                  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  SQLite (Desarrollo)         │
│  PostgreSQL (Producción)     │
└──────────────────────────────┘
```

## 📊 Endpoints API

### 🔐 Auth
```
POST   /api/auth/register     # Crear cuenta
POST   /api/auth/login        # Iniciar sesión
GET    /api/auth/profile      # Obtener perfil (requiere JWT)
```

### 🏠 Cabins
```
GET    /api/cabins            # Listar todas
GET    /api/cabins/:id        # Obtener por ID
POST   /api/cabins            # Crear (requiere JWT)
PUT    /api/cabins/:id        # Actualizar (requiere JWT)
DELETE /api/cabins/:id        # Eliminar (requiere JWT)
```

### 📅 Bookings
```
POST   /api/bookings          # Crear reserva (requiere JWT)
GET    /api/bookings          # Mis reservas (requiere JWT)
PATCH  /api/bookings/:id      # Cancelar (requiere JWT)
```

### ⭐ Reviews
```
POST   /api/reviews           # Crear reseña (requiere JWT)
GET    /api/reviews/cabin/:id # Obtener reseñas
```

## 🔒 Modelos de BD

### User
- `id` → ID único
- `email` → Email único
- `name` → Nombre completo
- `password` → Encriptado con bcryptjs
- `phone` → Teléfono (opcional)
- `avatar` → URL de foto (opcional)
- Relaciones: Cabins, Bookings, Reviews

### Cabin
- `id` → ID único
- `title` → Nombre de la cabaña
- `description` → Descripción detallada
- `location` → Ubicación
- `latitude/longitude` → Coordenadas GPS
- `price` → Precio por noche
- `capacity` → Personas que caben
- `bedrooms/bathrooms` → Cantidad
- `amenities` → JSON array de servicios
- `images` → JSON array de fotos
- Relaciones: Owner (User), Bookings, Reviews

### Booking
- `id` → ID único
- `cabinId` → Cabaña reservada
- `userId` → Usuario que reserva
- `checkIn/checkOut` → Fechas
- `totalPrice` → Precio total
- `status` → pending/confirmed/cancelled

### Review
- `id` → ID único
- `cabinId` → Cabaña reseñada
- `userId` → Usuario que revisa
- `rating` → 1-5 estrellas
- `comment` → Texto de la reseña

## 🚀 Rutas Principales (Frontend)

```
/                      # Inicio
/login                 # Autenticación
/register              # Registro
/cabins                # Listado
/cabins/:id            # Detalle
/my-bookings           # Mis reservas (protegida)
/profile               # Perfil (protegida)
```

## 📦 Dependencias Principales

### Backend
- express: Framework web
- @prisma/client: ORM
- jsonwebtoken: JWT
- bcryptjs: Encriptación
- cors: CORS middleware
- jest + supertest: Testing

### Frontend
- react: UI
- react-router-dom: Enrutamiento
- axios: HTTP client
- bootstrap: CSS framework
- @react-google-maps/api: Mapas

## 🎯 Features Implementadas

✅ Autenticación completa (Registro/Login)
✅ Navbar responsive
✅ Listado de cabañas
✅ Detalles de cabaña con reseñas
✅ Sistema de reservas
✅ API RESTful con validación
✅ JWT Security
✅ Bootstrap 5 Styling
✅ Context API para estado global
✅ Tests automatizados

## 🔄 Flujo de Autenticación

```
1. Usuario se registra
   └─> Email validado
   └─> Contraseña encriptada
   └─> JWT token generado
   └─> Guardado en localStorage

2. Usuario inicia sesión
   └─> Credenciales verificadas
   └─> JWT token generado
   └─> Token enviado en cada request

3. Middleware valida JWT
   └─> Token decodificado
   └─> Usuario anexado a request
   └─> Request autorizado
```

## 📱 Responsive Breakpoints

```
Extra pequeño: < 576px    (Móvil)
Pequeño: ≥ 576px          (Móvil grande)
Mediano: ≥ 768px          (Tablet)
Grande: ≥ 992px           (Desktop)
Extra grande: ≥ 1200px    (Desktop grande)
```

---

**Creado**: Noviembre 2024
**Versión**: 1.0.0
**Status**: ✅ Producción lista
