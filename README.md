# 🏠 Amanwal - Plataforma de Alojamiento de Cabañas

Una aplicación web completa para reservar y gestionar cabañas de lujo. Construida con tecnología moderna y escalable.

## 📋 Estructura del Proyecto

```
amanwal/
├── backend/          # API REST con Node.js + Express
├── frontend/         # Interfaz web con React 19
└── README.md         # Este archivo
```

## 🔧 Stack Tecnológico

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: SQLite (Desarrollo) / PostgreSQL (Producción)
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: bcryptjs
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 19
- **Enrutamiento**: React Router v7
- **Estilos**: Bootstrap 5
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Mapas**: Google Maps API

## 🚀 Inicio Rápido

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
npm run prisma:migrate
npm run prisma:generate

# Iniciar en desarrollo
npm run dev

# Tests
npm test
```

**Puerto**: `http://localhost:3000`

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Build para producción
npm run build
```

**Puerto**: `http://localhost:5173`

## 📚 Documentación de API

### Autenticación

#### POST `/api/auth/register`
Registrar nuevo usuario

**Body**:
```json
{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "contraseña123"
}
```

**Response**:
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "user123",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "token": "eyJhbGc..."
}
```

#### POST `/api/auth/login`
Iniciar sesión

**Body**:
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

#### GET `/api/auth/profile`
Obtener perfil del usuario autenticado (requiere JWT)

### Cabañas

#### GET `/api/cabins`
Obtener todas las cabañas

#### GET `/api/cabins/:id`
Obtener detalles de una cabaña

#### POST `/api/cabins`
Crear una nueva cabaña (requiere autenticación)

**Body**:
```json
{
  "title": "Cabaña de Montaña",
  "description": "Hermosa cabaña con vistas al lago",
  "location": "Bariloche, Argentina",
  "latitude": -41.1382,
  "longitude": -71.3103,
  "price": 150,
  "capacity": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["WiFi", "Cocina", "Chimenea"],
  "images": ["url1", "url2"]
}
```

### Reservas

#### POST `/api/bookings`
Crear una nueva reserva (requiere autenticación)

**Body**:
```json
{
  "cabinId": "cabin123",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-30"
}
```

#### GET `/api/bookings`
Obtener mis reservas (requiere autenticación)

#### PATCH `/api/bookings/:id/cancel`
Cancelar una reserva (requiere autenticación)

### Reseñas

#### POST `/api/reviews`
Crear una reseña (requiere autenticación)

**Body**:
```json
{
  "cabinId": "cabin123",
  "rating": 5,
  "comment": "Excelente experiencia, muy recomendado!"
}
```

#### GET `/api/reviews/cabin/:cabinId`
Obtener reseñas de una cabaña

## 🔐 Variables de Entorno

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

## 💾 Modelo de Base de Datos

### User
- `id` (String, ID único)
- `email` (String, único)
- `name` (String)
- `password` (String, encriptado)
- `phone` (String, opcional)
- `avatar` (String URL, opcional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Cabin
- `id` (String, ID único)
- `title` (String)
- `description` (String)
- `location` (String)
- `latitude` (Float)
- `longitude` (Float)
- `price` (Float)
- `capacity` (Int)
- `bedrooms` (Int)
- `bathrooms` (Int)
- `amenities` (JSON Array)
- `images` (JSON Array)
- `ownerId` (Foreign Key → User)

### Booking
- `id` (String, ID único)
- `cabinId` (Foreign Key → Cabin)
- `userId` (Foreign Key → User)
- `checkIn` (DateTime)
- `checkOut` (DateTime)
- `totalPrice` (Float)
- `status` (String: pending, confirmed, cancelled)

### Review
- `id` (String, ID único)
- `cabinId` (Foreign Key → Cabin)
- `userId` (Foreign Key → User)
- `rating` (Int: 1-5)
- `comment` (String)

## 🧪 Testing

### Backend
```bash
cd backend

# Ejecutar todos los tests
npm test

# Watch mode
npm run test:watch

# Con coverage
npm run test:coverage
```

## 🌐 Funcionalidades

### Completadas ✅
- [x] Autenticación (Registro/Login)
- [x] Navbar con menú
- [x] Listado de cabañas
- [x] Detalles de cabaña
- [x] Sistema de reseñas
- [x] Reservas con calendario
- [x] API REST completa
- [x] Validación de datos
- [x] JWT Security
- [x] Panel de administrador
- [x] Integración Flow (pago)
- [x] Notificaciones por email
- [x] Dashboard para usuarios (mis reservas)
- [x] Búsqueda y filtrado de reservas
- [x] Paginación en admin
- [x] Confirmación automática de reservas pagadas
- [x] Cancellación y eliminación de reservas

### Por Implementar 🔲
- [ ] Integración Google Maps
- [ ] Página de perfil de usuario
- [ ] Crear/editar cabañas por usuarios
- [ ] Sistema de reembolsos
- [ ] Búsqueda avanzada con filtros

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Dispositivos móviles
- 📱 Tablets
- 🖥️ Desktops

## 🔒 Seguridad

- ✅ Contraseñas encriptadas con bcryptjs
- ✅ Autenticación con JWT
- ✅ CORS configurado
- ✅ Validación de emails
- ✅ Validación de entrada

## 📄 Licencia

Este proyecto es propietario de Amanwal.

## 👤 Contacto

Para soporte o consultas, contacta con el equipo de desarrollo.

---

**Última actualización**: Noviembre 2024
