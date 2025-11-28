## 🚀 INICIO RÁPIDO - AMANWAL

Este es el guía más rápida para empezar. Para más detalles, lee `SETUP.md`.

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
└── README.md   ← Documentación completa
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
| `README.md` | 📖 Overview completo |
| `SETUP.md` | 🔧 Instalación detallada |
| `ARQUITECTURA.md` | 🏗️ Estructura y endpoints |
| `CHECKLIST.md` | ✅ Tareas y próximos pasos |
| `.dev-guide.md` | 👨‍💻 Guía de desarrollo |

---

## 🎯 Próximos Pasos

1. ✅ **Instalar y correr** - Ya lo hiciste!
2. 📝 **Crear cuenta de prueba** - Registrate en la app
3. 🔍 **Explorar API** - Checa los endpoints en `ARQUITECTURA.md`
4. 🛠️ **Entender el código** - Lee los archivos en src/
5. 🚀 **Agregar features** - Sigue el `CHECKLIST.md`

---

## 🎓 Archivos Importantes

**Backend:**
- `backend/src/server.ts` - Punto de entrada
- `backend/prisma/schema.prisma` - Modelos BD
- `backend/src/controllers/` - Lógica

**Frontend:**
- `frontend/src/App.tsx` - Componente raíz
- `frontend/src/pages/` - Páginas
- `frontend/src/api/` - Cliente HTTP

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

---

## 🚀 Ready to Code?

```bash
# Backend running? ✅ http://localhost:3000
# Frontend running? ✅ http://localhost:5173

# Happy coding! 🎉
```

---

**Created**: Noviembre 2024  
**Version**: 1.0.0  
**Status**: 🟢 Ready
