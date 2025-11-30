## 🚀 INICIO RÁPIDO - AMANWAL

Este es el guía más rápida para empezar. Para más detalles, lee `02-INSTALACION-COMPLETA.md`.

### 1️⃣ Requisitos Previos

- ✅ Node.js 18+ instalado ([Descargar](https://nodejs.org/))
- ✅ Terminal (CMD, PowerShell o Bash)

### 2️⃣ Windows - Inicio Automático

**Opción A: Script automático**
```bash
# Doble-click en start.bat
# O en PowerShell:
.\start.bat
```

**Opción B: Manual**
```bash
# Terminal 1:
cd backend && npm install && npm run dev

# Terminal 2:
cd frontend && npm install && npm run dev
```

### 3️⃣ macOS / Linux - Inicio Automático

```bash
# Hacer ejecutable y correr
chmod +x start.sh
./start.sh
```

### 4️⃣ Verificar Que Funciona

Abre tu navegador en **http://localhost:5173** ✨

Deberías ver:
- 🏠 Navbar con logo "Amanwal"
- 📝 Botones de Login/Register
- 🔗 Links de navegación

### 5️⃣ Primeras Acciones

1. **Crear Cuenta**
   - Click en "Registrarse"
   - Completa: email, nombre, contraseña
   - Recibirás un JWT token

2. **Explorar Cabañas**
   - Click en "Cabañas"
   - Ve la lista de alojamientos
   - Click en una cabaña para más detalles

3. **Ver API**
   - Abre http://localhost:3000/api/health
   - Deberías ver: `{"status":"OK","timestamp":"..."}`

---

## 📁 Estructura

```
amanwal/
├── backend/    ← API en Node.js (puerto 3000)
├── frontend/   ← Web en React (puerto 5173)
├── docs/       ← Documentación (este archivo está aquí)
└── README.md   ← Overview general
```

---

## 🆘 Problemas Comunes

**"Port 3000 already in use"**
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

**"Module not found"**
```bash
# Reinstalar todo
cd backend && rm -rf node_modules && npm install
```

**"Database error"**
```bash
# Recrear BD
cd backend
rm dev.db
npm run prisma:migrate
```

---

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| `00-BIENVENIDA.md` | 🏠 Inicio (estás aquí) |
| `02-INSTALACION-COMPLETA.md` | 🔧 Instalación detallada |
| `../guias/FLOW-PAGOS.md` | 💳 Integración de pagos |
| `../guias/NGROK-SETUP.md` | 🌐 Tuneleo ngrok |
| `../api/ARQUITECTURA.md` | 🏗️ Endpoints API |

---

## 🎯 Próximos Pasos

1. ✅ **Instalar y correr** - Ya lo hiciste!
2. 📝 **Crear cuenta de prueba** - Registrate en la app
3. 💳 **Configurar pagos** - Lee `../guias/FLOW-PAGOS.md`
4. 🌐 **Usar ngrok** - Lee `../guias/NGROK-SETUP.md`
5. 🚀 **Explorar código** - Revisa carpetas src/

---

## ✨ Que Está Implementado

✅ Autenticación (Login/Register)
✅ Navbar y Menú
✅ Listado de Cabañas
✅ Detalles de Cabaña
✅ Sistema de Reseñas
✅ API REST
✅ JWT Security
✅ Bootstrap 5
✅ Pagos con Flow
✅ Panel de administrador

---

## 🚀 Ready to Code?

```bash
# Backend running? ✅ http://localhost:3000
# Frontend running? ✅ http://localhost:5173

# Happy coding! 🎉
```

---

**Version**: 1.0.0  
**Status**: 🟢 Ready
