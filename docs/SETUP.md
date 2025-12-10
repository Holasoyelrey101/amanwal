# 📋 GUÍA DE INSTALACIÓN - AMANWAL

## Requisitos Previos

- **Node.js** versión 18 o superior ([Descargar](https://nodejs.org/))
- **npm** (viene con Node.js) o **yarn**
- **Git** (opcional, para control de versiones)

## Paso 1: Clonar o Descargar el Proyecto

Si ya tienes la carpeta `amanwal`, salta al Paso 2.

## Paso 2: Instalar Backend

```bash
cd amanwal/backend

# Instalar todas las dependencias
npm install
```

### Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos (opcional para desarrollo)
# DATABASE_URL=file:./dev.db
# PORT=3000
# NODE_ENV=development
# JWT_SECRET=tu_clave_secreta_aqui
```

### Inicializar la Base de Datos

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# (Opcional) Ver la BD en UI web
npm run prisma:studio
```

### Iniciar el Backend

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Output esperado:
# 🚀 Server running on http://localhost:3000
```

## Paso 3: Instalar Frontend

En otra terminal:

```bash
cd amanwal/frontend

# Instalar todas las dependencias
npm install
```

### Iniciar el Frontend

```bash
# Modo desarrollo
npm run dev

# Output esperado:
# VITE v5.0.8  ready in 100 ms
# ➜  Local:   http://localhost:5173/
```

## Paso 4: Verificar Que Todo Funciona

1. Abre tu navegador en `http://localhost:5173`
2. Deberías ver la página de inicio de Amanwal
3. Haz clic en "Registrarse" y crea una cuenta de prueba
4. Explora las cabañas

## 🧪 Testing

### Probar el Backend

```bash
cd backend

# Ejecutar tests
npm test

# Con watch mode
npm run test:watch
```

## 🏗️ Build para Producción

### Backend

```bash
cd backend

# Compilar TypeScript
npm run build

# Iniciar servidor en producción
npm start
```

### Frontend

```bash
cd frontend

# Build de producción
npm run build

# Vista previa
npm run preview
```

## 🐛 Troubleshooting

### Error: "Port 3000 is already in use"

```bash
# Windows - En PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### Error: "node-gyp ERR!"

```bash
# Instalar build tools
npm install -g node-gyp

# En Windows (como administrador):
npm install -g windows-build-tools
```

### Base de datos corrupta

```bash
# Eliminar la base de datos y recrearla
cd backend
rm dev.db
npm run prisma:migrate
```

### Frontend no se conecta al backend

Verifica que:
1. El backend esté corriendo en puerto 3000
2. En `frontend/src/api/client.ts` el `baseURL` sea correcto
3. No haya firewall bloqueando la conexión

## 📚 Recursos Útiles

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)

## ✅ Checklist de Setup

- [ ] Node.js instalado (verificar con `node -v`)
- [ ] npm instalado (verificar con `npm -v`)
- [ ] Backend: `npm install` completado
- [ ] Backend: `.env` configurado
- [ ] Backend: Base de datos migrada
- [ ] Backend: Servidor corriendo en puerto 3000
- [ ] Frontend: `npm install` completado
- [ ] Frontend: Servidor corriendo en puerto 5173
- [ ] Aplicación accesible en `http://localhost:5173`

---

¿Necesitas ayuda? Revisa los archivos README.md en cada carpeta (backend/ y frontend/).
