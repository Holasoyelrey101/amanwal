# ⚙️ CONFIGURACIÓN DE VARIABLES DE ENTORNO

Cómo configurar el archivo `.env` para desarrollo.

---

## 🔐 Backend (.env)

Crea archivo `backend/.env` con:

```bash
# ========== DATABASE ==========
DATABASE_URL="file:./dev.db"

# ========== SERVER ==========
PORT=3000
NODE_ENV=development

# ========== JWT ==========
JWT_SECRET=tu_clave_super_secreta_cambiar_en_produccion
JWT_EXPIRE=7d

# ========== EMAIL (Gmail) ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_aplicacion
FROM_EMAIL=noreply@amanwal.com

# ========== FLOW PAYMENT ==========
FLOW_API_KEY=tu_api_key_flow
FLOW_SECRET_KEY=tu_secret_flow
FLOW_ENVIRONMENT=sandbox

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:5173
```

---

## 💳 CONFIGURACIÓN DE FLOW

### 1. Crear Cuenta

1. Ve a [flow.cl](https://www.flow.cl)
2. Regístrate o inicia sesión
3. Verifica tu email

### 2. Obtener Credenciales

1. Ve a **Integraciones** → **Credenciales**
2. Copia **API Key** y **Secret Key**
3. Pega en `backend/.env`:

```bash
FLOW_API_KEY=tu_api_key_aqui
FLOW_SECRET_KEY=tu_secret_aqui
```

### 3. Modo Sandbox (Desarrollo)

```bash
FLOW_ENVIRONMENT=sandbox
```

Tarjetas de prueba:
```
Visa: 4111 1111 1111 1111
Fecha: 12/25
CVV: 123
```

---

## 📧 CONFIGURACIÓN DE EMAIL (Gmail)

### 1. Habilitar 2FA

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Click en **Security** (lado izquierdo)
3. Habilita **2-Step Verification**

### 2. Generar Contraseña de Aplicación

1. En Security, busca **App passwords**
2. Selecciona: App = "Mail", Device = "Windows"
3. Google genera contraseña (16 caracteres)
4. Copia y pega en `.env`:

```bash
SMTP_USER=tu_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### 3. Probar Email

El sistema enviará automáticamente emails cuando:
- Usuario se registra
- Usuario crea reserva
- Reserva se confirma
- Reserva se cancela

---

## 🌐 Frontend (.env.local)

Crea archivo `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Activar Cambios

Después de cambiar `.env`:

```bash
# Backend - Reiniciar
cd backend
npm run dev

# Frontend - Ya se actualiza automáticamente
```

---

## ✅ Verificar Configuración

### Backend

```bash
# Verifica que .env exista
ls backend/.env

# Verifica variables
cat backend/.env
```

### Email

```bash
# Crear una reserva y esperar a recibir email
# Si llega, la configuración está correcta ✅
```

### Flow

```bash
# Ir a "Mis Reservas"
# Click en "Pagar"
# Verifica que Flow abre
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**: El archivo `.env` contiene secretos. **Nunca** lo commits a Git.

```bash
# backend/.gitignore
.env
.env.local
.env.*.local
```

---

**Última actualización**: Noviembre 2025
