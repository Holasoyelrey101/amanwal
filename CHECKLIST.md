# ✅ CHECKLIST - Amanwal

## 🎯 Primer Inicio (OBLIGATORIO)

- [ ] **Instalar Node.js** desde https://nodejs.org/ (versión 18+)
- [ ] **Abrir terminal en la carpeta `amanwal`**
- [ ] **Backend**:
  ```bash
  cd backend
  npm install
  npm run prisma:migrate
  npm run prisma:generate
  npm run dev
  ```
- [ ] **Frontend (en otra terminal)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- [ ] **Verificar**:
  - Backend en http://localhost:3000/api/health
  - Frontend en http://localhost:5173

## 📋 Tareas Completadas ✅

- [x] Estructura Backend con Express.js
- [x] Modelos de BD con Prisma
- [x] Autenticación JWT
- [x] CRUD de Cabañas
- [x] Sistema de Reservas
- [x] Sistema de Reseñas
- [x] Validaciones de entrada
- [x] Encriptación de contraseñas
- [x] Tests unitarios (Auth)
- [x] Estructura Frontend con React 19
- [x] Routing con React Router v7
- [x] Context API (Auth)
- [x] Bootstrap 5 Styling
- [x] Cliente HTTP (Axios)
- [x] Componentes principales
- [x] Navbar responsiva
- [x] Rutas protegidas

## 🚀 Funcionalidades Próximas

### Backend
- [ ] **Integración con Google Maps**
  - [ ] Validar coordenadas GPS
  - [ ] Busqueda por proximidad

- [ ] **Sistema de Pagos**
  - [ ] Integrar Stripe
  - [ ] Webhook de pagos
  - [ ] Confirmación automática

- [ ] **Notificaciones**
  - [ ] Email de confirmación
  - [ ] Email de recordatorio
  - [ ] Sistema de alertas

- [ ] **Búsqueda Avanzada**
  - [ ] Filtrar por precio
  - [ ] Filtrar por capacidad
  - [ ] Filtrar por disponibilidad
  - [ ] Buscar por ubicación

### Frontend
- [ ] **Página de Perfil Completa**
  - [ ] Ver/editar información
  - [ ] Cambiar contraseña
  - [ ] Foto de perfil

- [ ] **Carrito de Reservas**
  - [ ] Agregar cabañas
  - [ ] Visualizar total
  - [ ] Checkout

- [ ] **Dashboard para Dueños**
  - [ ] Crear/editar cabañas
  - [ ] Gestionar reservas
  - [ ] Ver ganancias
  - [ ] Estadísticas

- [ ] **Integración Google Maps**
  - [ ] Mostrar ubicación cabaña
  - [ ] Vista de calor
  - [ ] Rutas

- [ ] **Búsqueda y Filtros**
  - [ ] Buscador principal
  - [ ] Filtros avanzados
  - [ ] Ordenamiento

- [ ] **Galería de Imágenes**
  - [ ] Slider de fotos
  - [ ] Zoom
  - [ ] Vista en grid

## 🔧 Configuración Recomendada

### Variables de Entorno (.env)

**Backend** (`backend/.env`):
```
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_super_segura_cambiar_en_produccion
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=AIza... (obtener en Google Cloud Console)
STRIPE_SECRET_KEY=sk_test_... (obtener en Stripe Dashboard)
SENDGRID_API_KEY=SG.... (para emails)
```

### Cuentas Externas Necesarias

- [ ] [Google Cloud Console](https://console.cloud.google.com/) - Google Maps API
- [ ] [Stripe Dashboard](https://dashboard.stripe.com/) - Pagos
- [ ] [SendGrid](https://sendgrid.com/) - Emails
- [ ] [Vercel](https://vercel.com/) - Deploy Frontend
- [ ] [Heroku/Railway](https://railway.app/) - Deploy Backend

## 📚 Recursos de Aprendizaje

### Backend
- [Express.js Official Docs](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [RESTful API Best Practices](https://restfulapi.net/)

### Frontend
- [React Documentation](https://react.dev/)
- [React Router Guide](https://reactrouter.com/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [Axios Documentation](https://axios-http.com/)

### DevOps
- [Docker for Developers](https://www.docker.com/)
- [Git Guide](https://git-scm.com/doc)
- [CI/CD with GitHub Actions](https://docs.github.com/en/actions)

## 🐛 Debugging Tips

### Backend
```bash
# Ver logs en tiempo real
npm run dev

# Ver BD con UI
npm run prisma:studio

# Ejecutar tests con output detallado
npm test -- --verbose
```

### Frontend
```bash
# Abrir DevTools: F12 o Cmd+Shift+I
# React DevTools extension: https://react.dev/learn/react-developer-tools

# Console para debugging
console.log('data:', data);

# Network para ver requests
# Application para ver localStorage
```

## 📊 Métricas de Éxito

- [ ] 100% de rutas protegidas funcionando
- [ ] 0 errores en console
- [ ] Todas las validaciones activas
- [ ] BD sincronizada correctamente
- [ ] Respuesta API < 200ms
- [ ] UI responsiva en móvil, tablet, desktop
- [ ] Tests pasando al 100%

## 🎉 Deployment (Cuando esté listo)

### Frontend en Vercel
```bash
npm run build
# Subir carpeta 'dist' a Vercel
```

### Backend en Railway/Heroku
```bash
npm run build
# Configurar variables de entorno
# Conectar BD PostgreSQL
```

## 📞 Soporte

Si tienes problemas:
1. Revisa los README.md en cada carpeta
2. Consulta SETUP.md para instalación
3. Revisa ARQUITECTURA.md para entender la estructura
4. Usa las herramientas de debugging

---

**Última actualización**: Noviembre 2024
**Versión**: 1.0.0
