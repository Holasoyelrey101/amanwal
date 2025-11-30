# 🚀 GUÍA COMPLETA DE INSTALACIÓN - AMANWAL

Esta guía te llevará paso a paso para instalar todo correctamente.

---

## 📋 Requisitos Previos

Verifica que tengas instalado:

```bash
# Node.js (versión 18+)
node -v

# npm
npm -v
```

Si no están instalados, descarga desde [nodejs.org](https://nodejs.org/)

---

## 🔧 Opción 1: INSTALACIÓN AUTOMÁTICA (Windows)

### Paso 1: Ejecutar Script

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

## 🔧 Opción 2: INSTALACIÓN MANUAL

### Paso 1: Instalar Backend

Abre una **terminal** en la carpeta `amanwal`:

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
```

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

## 📚 Próximos Pasos

1. ✅ Aplicación instalada y corriendo
2. 💳 Configura pagos: `../guias/FLOW-PAGOS.md`
3. 🌐 Configura ngrok: `../guias/NGROK-SETUP.md`
4. 📧 Configura email: `../guias/EMAIL-SETUP.md`

---

**Última actualización**: Noviembre 2025
