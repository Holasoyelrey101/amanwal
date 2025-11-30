# 🌐 GUÍA DE NGROK - Tuneleo Público para AMANWAL

Ngrok crea un túnel público a tu servidor local para que Flow (y otros servicios) puedan acceder a tu backend.

---

## 📥 Paso 1: Descargar e Instalar Ngrok

### Windows

1. Ve a [ngrok.com](https://ngrok.com/download)
2. Descarga la versión Windows
3. Extrae el archivo en una carpeta (ej: `C:\ngrok`)
4. Abre PowerShell como Administrador:

```powershell
# Verifica que ngrok funciona
C:\ngrok\ngrok --version
```

### macOS

```bash
# Con Homebrew
brew install ngrok

# O descarga manualmente desde ngrok.com
```

### Linux

```bash
# Descarga
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip

# Extrae
unzip ngrok-v3-stable-linux-amd64.zip

# Permiso de ejecución
chmod +x ngrok

# Verifica
./ngrok --version
```

---

## 🔑 Paso 2: Obtener Token de Autenticación

1. Crea cuenta en [ngrok.com](https://ngrok.com/signup)
2. Verifica tu email
3. Ve a [Dashboard → Auth Token](https://dashboard.ngrok.com/auth/your-authtoken)
4. Copia tu token (ej: `2VV5xxxxxxxxxxxxxxxxxxxx_xxxxxxxxxxxxx`)

---

## ⚙️ Paso 3: Configurar Ngrok

### Windows (PowerShell)

```powershell
# Ejecutar ngrok
C:\ngrok\ngrok authtoken YOUR_AUTH_TOKEN_HERE

# Debería mostrar: "Authtoken saved to configuration file"
```

### macOS / Linux

```bash
ngrok authtoken YOUR_AUTH_TOKEN_HERE
```

---

## 🚀 Paso 4: Iniciar Ngrok

Una vez que tu **backend está corriendo en puerto 3000**, en **otra terminal**:

### Windows (PowerShell)

```powershell
C:\ngrok\ngrok http 3000
```

### macOS / Linux

```bash
ngrok http 3000
```

---

## ✅ Verificar que Funciona

Deberías ver algo como:

```
ngrok                                       (Ctrl+C to quit)

Session Status                online
Session ID                    2VVxxxxxxxxxxxxxxxxxxxx
Version                       3.0.0
Region                        us-california
Forwarding                    https://troublesome-trinity-subvitreously.ngrok-free.dev -> http://localhost:3000
Forwarding                    http://troublesome-trinity-subvitreously.ngrok-free.dev -> http://localhost:3000

Web Interface                 http://127.0.0.1:4040
```

**Tu URL pública es**: `https://troublesome-trinity-subvitreously.ngrok-free.dev`

---

## 🔗 Paso 5: Actualizar Configuración

### 1. En Flow.cl (Dashboard)

1. Ve a **Integraciones** → **URLs de Retorno**
2. Configura:
   - **URL de Retorno**: `https://tu-url-ngrok/api/payments/return`
   - **URL de Webhook**: `https://tu-url-ngrok/api/payments/confirm`

Ejemplo:
```
https://troublesome-trinity-subvitreously.ngrok-free.dev/api/payments/return
https://troublesome-trinity-subvitreously.ngrok-free.dev/api/payments/confirm
```

### 2. En backend/.env

```bash
# Actualizar con tu URL de ngrok
FLOW_RETURN_URL=https://tu-url-ngrok/api/payments/return
```

---

## 🔄 Flujo Completo con Ngrok

```
1. Usuario hace pago en Flow
   ↓
2. Flow redirige a: https://tu-url-ngrok/api/payments/return
   ↓
3. Ngrok túnela a: http://localhost:3000/api/payments/return
   ↓
4. Backend procesa pago
   ↓
5. Backend redirige a: http://localhost:5173/payment-return/:bookingId
   ↓
6. Frontend muestra "¡Pago Realizado!"
   ↓
7. Confirmación automática
```

---

## 📋 Checklist de Inicio con Ngrok

```
✅ Ngrok instalado y funcionando
✅ Token de autenticación configurado
✅ Backend corriendo en puerto 3000
✅ Ngrok creó túnel a puerto 3000
✅ URL pública generada (https://xxxxx.ngrok.io)
✅ Flow.cl configurado con URL de ngrok
✅ backend/.env actualizado con URL de ngrok
✅ Probé un pago y funcionó
```

---

## 🔍 Solución de Problemas

### ❌ "AuthToken not valid"

```bash
# Vuelve a autenticar
ngrok authtoken YOUR_AUTH_TOKEN_HERE
```

### ❌ "No session credentials provided"

1. Crea cuenta en ngrok.com
2. Ve a Dashboard y obtén tu Auth Token
3. Ejecuta: `ngrok authtoken YOUR_TOKEN`

### ❌ "Connection refused" desde Flow

1. Verifica que backend esté corriendo en puerto 3000
2. Verifica que ngrok esté activo
3. Prueba tu URL de ngrok en navegador: `https://tu-url-ngrok/api/health`

### ❌ La URL de ngrok cambió

**Importante**: Cada vez que inicias ngrok, **cambiarás de URL pública**.

Soluciones:
- **Opción 1**: Cada vez que inicies ngrok, actualiza la URL en Flow.cl
- **Opción 2**: Usa plan de pago de ngrok para URL fija ($5/mes)
- **Opción 3**: Usa script que actualice automáticamente

---

## 💡 Tips Útiles

### Ver tráfico en tiempo real

Ngrok abre un dashboard en `http://127.0.0.1:4040`

Aquí ves:
- Todas las peticiones HTTP
- Request/Response headers
- Body de las peticiones
- Logs completos

### Usar ngrok sin salir de PowerShell

```powershell
# Crear alias
Set-Alias -Name ngrok -Value "C:\ngrok\ngrok.exe"

# Luego solo:
ngrok http 3000
```

---

**Happy Tunneling! 🌐**

---

**Última actualización**: Noviembre 2025
