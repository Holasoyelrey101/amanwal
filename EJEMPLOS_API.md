# 🧪 EJEMPLOS DE API - AMANWAL

Ejemplos reales de cómo usar todos los endpoints de la API.

## 🔐 Autenticación

### 1. Registrarse

**Endpoint:**
```
POST http://localhost:3000/api/auth/register
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "password": "password123"
  }'
```

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "clpxyz123",
    "email": "juan@example.com",
    "name": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Iniciar Sesión

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "clpxyz123",
    "email": "juan@example.com",
    "name": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Obtener Perfil

**Endpoint:**
```
GET http://localhost:3000/api/auth/profile
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Response (200):**
```json
{
  "id": "clpxyz123",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "phone": "+54 9 123 456 7890",
  "avatar": "https://...",
  "createdAt": "2024-11-27T10:30:00Z"
}
```

---

## 🏠 Cabañas

### 4. Obtener Todas las Cabañas

**Endpoint:**
```
GET http://localhost:3000/api/cabins
```

**Request (sin autenticación):**
```bash
curl http://localhost:3000/api/cabins
```

**Response (200):**
```json
[
  {
    "id": "cabin001",
    "title": "Cabaña Montaña",
    "description": "Hermosa cabaña con vistas al lago",
    "location": "Bariloche, Argentina",
    "latitude": -41.1382,
    "longitude": -71.3103,
    "price": 150,
    "capacity": 6,
    "bedrooms": 3,
    "bathrooms": 2,
    "amenities": "[\"WiFi\", \"Cocina\", \"Chimenea\"]",
    "images": "[\"url1\", \"url2\"]",
    "ownerId": "user123",
    "owner": {
      "id": "user123",
      "name": "Pedro García",
      "email": "pedro@example.com"
    }
  },
  ...
]
```

---

### 5. Obtener Una Cabaña Específica

**Endpoint:**
```
GET http://localhost:3000/api/cabins/:id
```

**Request:**
```bash
curl http://localhost:3000/api/cabins/cabin001
```

**Response (200):**
```json
{
  "id": "cabin001",
  "title": "Cabaña Montaña",
  "description": "Hermosa cabaña con vistas al lago",
  "location": "Bariloche, Argentina",
  "latitude": -41.1382,
  "longitude": -71.3103,
  "price": 150,
  "capacity": 6,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": "[\"WiFi\", \"Cocina\", \"Chimenea\"]",
  "images": "[\"url1\", \"url2\"]",
  "ownerId": "user123",
  "owner": {
    "id": "user123",
    "name": "Pedro García",
    "email": "pedro@example.com"
  },
  "reviews": [
    {
      "id": "review001",
      "rating": 5,
      "comment": "Excelente lugar!",
      "userId": "user456",
      "createdAt": "2024-11-20T15:30:00Z"
    }
  ]
}
```

---

### 6. Crear una Cabaña

**Endpoint:**
```
POST http://localhost:3000/api/cabins
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/cabins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "title": "Cabaña de Playa",
    "description": "Hermosa cabaña frente al mar",
    "location": "Mar del Plata, Argentina",
    "latitude": -37.9961,
    "longitude": -57.5569,
    "price": 200,
    "capacity": 8,
    "bedrooms": 4,
    "bathrooms": 3,
    "amenities": ["WiFi", "Piscina", "Asador", "Jacuzzi"],
    "images": ["url1", "url2", "url3"]
  }'
```

**Response (201):**
```json
{
  "id": "cabin002",
  "title": "Cabaña de Playa",
  "description": "Hermosa cabaña frente al mar",
  "location": "Mar del Plata, Argentina",
  "latitude": -37.9961,
  "longitude": -57.5569,
  "price": 200,
  "capacity": 8,
  "bedrooms": 4,
  "bathrooms": 3,
  "amenities": "[\"WiFi\", \"Piscina\", \"Asador\", \"Jacuzzi\"]",
  "images": "[\"url1\", \"url2\", \"url3\"]",
  "ownerId": "clpxyz123",
  "createdAt": "2024-11-27T10:35:00Z"
}
```

---

### 7. Actualizar una Cabaña

**Endpoint:**
```
PUT http://localhost:3000/api/cabins/:id
```

**Request:**
```bash
curl -X PUT http://localhost:3000/api/cabins/cabin002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "price": 250,
    "title": "Cabaña Playa Premium"
  }'
```

**Response (200):**
```json
{
  "id": "cabin002",
  "title": "Cabaña Playa Premium",
  "price": 250,
  ...
}
```

---

### 8. Eliminar una Cabaña

**Endpoint:**
```
DELETE http://localhost:3000/api/cabins/:id
```

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/cabins/cabin002 \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Response (200):**
```json
{
  "message": "Cabaña eliminada exitosamente"
}
```

---

## 📅 Reservas

### 9. Crear una Reserva

**Endpoint:**
```
POST http://localhost:3000/api/bookings
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "cabinId": "cabin001",
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-30"
  }'
```

**Response (201):**
```json
{
  "id": "booking001",
  "cabinId": "cabin001",
  "userId": "clpxyz123",
  "checkIn": "2024-12-25T00:00:00Z",
  "checkOut": "2024-12-30T00:00:00Z",
  "totalPrice": 750,
  "status": "pending",
  "createdAt": "2024-11-27T10:40:00Z"
}
```

**Cálculo:** 5 noches × $150/noche = $750

---

### 10. Obtener Mis Reservas

**Endpoint:**
```
GET http://localhost:3000/api/bookings
```

**Request:**
```bash
curl http://localhost:3000/api/bookings \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Response (200):**
```json
[
  {
    "id": "booking001",
    "cabinId": "cabin001",
    "userId": "clpxyz123",
    "checkIn": "2024-12-25T00:00:00Z",
    "checkOut": "2024-12-30T00:00:00Z",
    "totalPrice": 750,
    "status": "pending",
    "cabin": {
      "id": "cabin001",
      "title": "Cabaña Montaña",
      "price": 150,
      "location": "Bariloche, Argentina"
    }
  },
  ...
]
```

---

### 11. Cancelar una Reserva

**Endpoint:**
```
PATCH http://localhost:3000/api/bookings/:id/cancel
```

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/bookings/booking001/cancel \
  -H "Authorization: Bearer TOKEN_AQUI"
```

**Response (200):**
```json
{
  "id": "booking001",
  "cabinId": "cabin001",
  "userId": "clpxyz123",
  "checkIn": "2024-12-25T00:00:00Z",
  "checkOut": "2024-12-30T00:00:00Z",
  "totalPrice": 750,
  "status": "cancelled",
  "createdAt": "2024-11-27T10:40:00Z"
}
```

---

## ⭐ Reseñas

### 12. Crear una Reseña

**Endpoint:**
```
POST http://localhost:3000/api/reviews
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -d '{
    "cabinId": "cabin001",
    "rating": 5,
    "comment": "Lugar increíble! Volvería sin dudarlo. Excelente atención y muy limpio."
  }'
```

**Response (201):**
```json
{
  "id": "review001",
  "cabinId": "cabin001",
  "userId": "clpxyz123",
  "rating": 5,
  "comment": "Lugar increíble! Volvería sin dudarlo. Excelente atención y muy limpio.",
  "createdAt": "2024-11-27T10:45:00Z"
}
```

---

### 13. Obtener Reseñas de una Cabaña

**Endpoint:**
```
GET http://localhost:3000/api/reviews/cabin/:cabinId
```

**Request:**
```bash
curl http://localhost:3000/api/reviews/cabin/cabin001
```

**Response (200):**
```json
[
  {
    "id": "review001",
    "cabinId": "cabin001",
    "userId": "clpxyz123",
    "rating": 5,
    "comment": "Lugar increíble!",
    "createdAt": "2024-11-27T10:45:00Z",
    "user": {
      "id": "clpxyz123",
      "name": "Juan Pérez",
      "avatar": "https://..."
    }
  },
  {
    "id": "review002",
    "cabinId": "cabin001",
    "userId": "user456",
    "rating": 4,
    "comment": "Muy bueno, recomendado",
    "createdAt": "2024-11-25T15:30:00Z",
    "user": {
      "id": "user456",
      "name": "María González",
      "avatar": "https://..."
    }
  },
  ...
]
```

---

## 🛠️ Health Check

### 14. Verificar que el servidor funciona

**Endpoint:**
```
GET http://localhost:3000/api/health
```

**Request:**
```bash
curl http://localhost:3000/api/health
```

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-11-27T10:50:00.123Z"
}
```

---

## 📋 Resumen de Endpoints

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | /auth/register | ❌ | Registrar usuario |
| POST | /auth/login | ❌ | Iniciar sesión |
| GET | /auth/profile | ✅ | Obtener perfil |
| GET | /cabins | ❌ | Listar cabañas |
| GET | /cabins/:id | ❌ | Detalles cabaña |
| POST | /cabins | ✅ | Crear cabaña |
| PUT | /cabins/:id | ✅ | Actualizar cabaña |
| DELETE | /cabins/:id | ✅ | Eliminar cabaña |
| POST | /bookings | ✅ | Crear reserva |
| GET | /bookings | ✅ | Mis reservas |
| PATCH | /bookings/:id/cancel | ✅ | Cancelar reserva |
| POST | /reviews | ✅ | Crear reseña |
| GET | /reviews/cabin/:id | ❌ | Reseñas de cabaña |
| GET | /health | ❌ | Health check |

---

## 🔑 Estructura del Token JWT

Cuando recibes un token, tiene este formato:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiJjbHB4eXoxMjMiLCJpYXQiOjE3MzI2NzcwMjcsImV4cCI6MTczMzI4MTgyN30.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ

Header.Payload.Signature
```

**Usar el token:**
```bash
curl -H "Authorization: Bearer TOKEN_AQUI" http://localhost:3000/api/auth/profile
```

---

## ⚠️ Códigos de Error

| Código | Significado |
|--------|------------|
| 200 | Éxito |
| 201 | Creado exitosamente |
| 400 | Solicitud inválida (datos faltantes/inválidos) |
| 401 | No autenticado (falta token o inválido) |
| 403 | No autorizado (no tienes permisos) |
| 404 | No encontrado |
| 500 | Error del servidor |

---

## 💡 Tips

1. **Guarda el token** después de login - lo necesitas en Authorization
2. **Token expira en 7 días** - después necesitas hacer login de nuevo
3. **Todos los POST/PUT necesitan** `Content-Type: application/json`
4. **Las fechas están en ISO 8601** - ejemplo: `2024-12-25T00:00:00Z`
5. **Los arrays se guardan como JSON strings** - decodifica cuando recibas

---

## 🧪 Testing en Postman

1. Abre [Postman](https://www.postman.com/)
2. Crea una nueva collection "Amanwal"
3. Copia cada endpoint de arriba
4. Prueba manualmente

O importa este JSON:
```json
{
  "info": {
    "name": "Amanwal API",
    "description": "API Amanwal Collection"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

---

**Ejemplos actualizados**: Noviembre 2024  
**API Version**: 1.0.0  
**Status**: ✅ Funcional
