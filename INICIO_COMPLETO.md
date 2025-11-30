# 🚀 GUÍA COMPLETA DE INICIO - AMANWAL

Esta guía te llevará paso a paso para iniciar toda la plataforma con sistema de pagos funcionando.

---

## 📋 Requisitos Previos

Verifica que tengas instalado:

```bash
# Node.js (versión 18+)
node -v

# npm
npm -v

# Opcional: Verificar Git
git -v
```

Si no están instalados, descarga desde [nodejs.org](https://nodejs.org/)

---

## 🎯 Opción 1: INICIO AUTOMÁTICO (Windows)

### Paso 1: Script de Inicio

Tienes dos opciones:

**A) Doble-click en `start.bat`** (más fácil)
- Abre automáticamente dos terminales
- Instala dependencias
- Inicia backend y frontend

**B) PowerShell**
```powershell
.\start.bat
```

Espera a ver:
```
✅ Backend corriendo: http://localhost:3000
✅ Frontend corriendo: http://localhost:5173
```

### Paso 2: Abre tu navegador

Ve a **http://localhost:5173** y deberías ver la aplicación.

---

## 🔧 Opción 2: INICIO MANUAL (Pasos por Pasos)

### Paso 1: Instalar Backend

Abre una **terminal/PowerShell** en la carpeta `amanwal`:

```bash
cd backend

# Instalar dependencias
npm install

# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones de BD (primera vez)
npm run prisma:migrate

# Iniciar servidor
npm run dev
```

✅ Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
```

### Paso 2: Instalar Frontend

Abre **otra terminal** en la carpeta `amanwal`:

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor
npm run dev
```

✅ Deberías ver:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Paso 3: Acceder a la Aplicación

Abre tu navegador en: **http://localhost:5173**

---

## 🔐 Configuración de Variables de Entorno

### Backend (.env)

Si el archivo `backend/.env` no existe, créalo basado en `.env.example`:

```bash
# database/prisma
DATABASE_URL="file:./dev.db"

# server
PORT=3000
NODE_ENV=development

# jwt
JWT_SECRET=tu_clave_super_secreta_cambiar_en_produccion
JWT_EXPIRE=7d

# email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_aplicacion
FROM_EMAIL=noreply@amanwal.com

# flow payment (Chile)
FLOW_API_KEY=tu_api_key_flow
FLOW_SECRET_KEY=tu_secret_flow
FLOW_ENVIRONMENT=sandbox
FLOW_RETURN_URL=http://localhost:3000/api/payments/return

# frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

Crea `frontend/.env.local` si es necesario:

```bash
VITE_API_URL=http://localhost:3000
```

---

## 💳 Configurar Pagos con Flow

### 1. Crear Cuenta en Flow

1. Ve a [flow.cl](https://www.flow.cl)
2. Regístrate o inicia sesión
3. Ve a **Integraciones** → **Credenciales**
4. Copia tu **API Key** y **Secret Key** en `backend/.env`

### 2. Modo Sandbox (Desarrollo)

Flow ofrece ambiente de prueba:

```
FLOW_ENVIRONMENT=sandbox

# Tarjetas de prueba:
Visa: 4111 1111 1111 1111
Fecha: 12/25
CVV: 123
```

### 3. Probar Pago

1. Crea una reserva en la aplicación
2. Click en "Pagar"
3. Completa los datos con tarjeta de prueba
4. El pago se confirmará automáticamente
5. Recibirás email de confirmación

---

## 🎮 Primeros Pasos en la Aplicación

### 1. Crear Cuenta

1. Click en **"Registrarse"**
2. Completa:
   - Email: `tu_email@example.com`
   - Nombre: `Tu Nombre`
   - Contraseña: `tu_contraseña_segura`
3. Click en **"Registrarse"**
4. ✅ Ya estás logueado

### 2. Explorar Cabañas

1. Click en **"Cabañas"** o icono de inicio
2. Ve el listado de cabañas disponibles
3. Click en una cabaña para ver detalles
4. Ve fotos, amenidades, ubicación

### 3. Hacer una Reserva

1. Selecciona las fechas (Check-in y Check-out)
2. Click en **"Reservar"**
3. Se calcula el precio automáticamente
4. La reserva se crea con estado "Pendiente de Pago"

### 4. Pagar con Flow

1. En la reserva, click en **"Pagar"**
2. Se abre Flow en una nueva ventana
3. Completa con tarjeta de prueba
4. Click en **"Pagar"**
5. Regresa automáticamente a la aplicación
6. ✅ Ver mensaje: **"¡Pago Realizado!"**
7. La reserva cambia a estado **"Confirmada"**

### 5. Ver Mis Reservas

1. Click en **"Mis Reservas"** (en navbar)
2. Ve todas tus reservas con estado
3. Puedes cancelar si es necesario

### 6. Panel de Administrador

1. Login con cuenta admin
2. Click en **"Admin"** (en navbar)
3. Ver:
   - **Dashboard**: Resumen general
   - **Usuarios**: Listar/editar usuarios
   - **Cabañas**: Crear/editar cabañas
   - **Reservas**: Buscar, filtrar, paginar, cancelar, confirmar
   - **Reseñas**: Moderar reseñas

---

## 🔍 Troubleshooting

### ❌ Error: "Port 3000 already in use"

```bash
# Encontrar proceso en puerto 3000
netstat -ano | findstr :3000

# Matar proceso (reemplazar PID)
taskkill /PID [PID] /F
```

### ❌ Error: "Cannot find module..."

```bash
# Reinstalar dependencias
cd backend
rm -r node_modules
npm install

# Lo mismo para frontend
cd ../frontend
rm -r node_modules
npm install
```

### ❌ Error de Base de Datos

```bash
# Recrear BD desde cero
cd backend
rm dev.db
npm run prisma:migrate
npm run dev
```

### ❌ Frontend no conecta a Backend

Verifica:
1. Backend está corriendo en `http://localhost:3000`
2. Frontend está corriendo en `http://localhost:5173`
3. No hay firewall bloqueando
4. `.env` del frontend tiene URL correcta

### ❌ Email no se envía

Verifica en `backend/.env`:
```bash
# Si usas Gmail, necesitas contraseña de aplicación:
# 1. Ve a Google Account → Security
# 2. Busca "App passwords"
# 3. Genera contraseña para "Mail" y "Windows"
# 4. Usa esa contraseña en SMTP_PASS
```

### ❌ Reserva no cambia de estado después de pagar

1. Verifica que Flow webhook esté configurado
2. Revisa logs del backend para errores
3. Comprueba que el endpoint `/bookings/:id/confirm` se llamó

---

## 📊 Verificar que Todo Funciona

### Checklist de Verificación

```
✅ Backend corriendo (http://localhost:3000)
✅ Frontend corriendo (http://localhost:5173)
✅ BD SQLite creada (backend/dev.db)
✅ Aplicación carga sin errores
✅ Puedes registrarse
✅ Ves listado de cabañas
✅ Puedes crear reserva
✅ Flow payment abre correctamente
✅ Pago se procesa
✅ Reserva cambia a "Confirmada"
✅ Email de confirmación llega
```

---

## 🚀 Comando de Inicio Rápido

Una vez que todo está instalado:

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Luego abre: http://localhost:5173
```

---

## 📚 Documentación Adicional

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Overview del proyecto |
| `ARQUITECTURA.md` | Endpoints API y estructura |
| `CHECKLIST.md` | Tareas completadas y pendientes |
| `SETUP.md` | Instalación detallada |
| `QUICKSTART.md` | Inicio rápido |
| `backend/EMAIL_SETUP.md` | Configurar emails |

---

## 🔗 Enlaces Útiles

- 📖 [Node.js Docs](https://nodejs.org/docs/)
- 🚀 [Express.js](https://expressjs.com/)
- ⚛️ [React Docs](https://react.dev/)
- 🗄️ [Prisma ORM](https://www.prisma.io/)
- 🎨 [Bootstrap 5](https://getbootstrap.com/)
- 💳 [Flow.cl API](https://www.flow.cl/developers)

---

## 💡 Tips Útiles

### Desarrollar sin guardar

Frontend tiene hot reload automático. Cualquier cambio se refleja inmediatamente.

### Ver BD en UI

```bash
cd backend
npm run prisma:studio
# Abre http://localhost:5555 en navegador
```

### Ejecutar tests

```bash
cd backend
npm test
```

### Build para producción

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 🆘 ¿Necesitas Ayuda?

1. Revisa los logs en la terminal
2. Busca en los archivos de documentación
3. Verifica el `.env` está correcto
4. Comprueba que puertos 3000 y 5173 estén libres

---

## ✨ ¡Listo para Empezar!

```
🎉 Ya tienes todo para usar AMANWAL
🏠 Sistema de reserva de cabañas
💳 Pagos integrados con Flow
👥 Panel de administrador
📧 Notificaciones por email
```

**Happy Coding! 🚀**

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0 - Completa
**Estado**: 🟢 Producción Ready
