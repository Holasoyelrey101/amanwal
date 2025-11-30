# 📚 ÍNDICE DE DOCUMENTACIÓN - AMANWAL

Bienvenido a la documentación centralizada de AMANWAL.

---

## 🚀 INICIO RÁPIDO

**¿Primera vez?** Empieza aquí:

1. [`docs/inicio/00-BIENVENIDA.md`](docs/inicio/00-BIENVENIDA.md) - Overview
2. [`docs/inicio/01-INICIO-RAPIDO.md`](docs/inicio/01-INICIO-RAPIDO.md) - 5 minutos
3. [`docs/inicio/02-INSTALACION-COMPLETA.md`](docs/inicio/02-INSTALACION-COMPLETA.md) - Paso a paso
4. [`docs/inicio/03-CONFIGURACION-ENV.md`](docs/inicio/03-CONFIGURACION-ENV.md) - Configurar variables

---

## 📋 GUÍAS ESPECÍFICAS

### Configuración de Servicios

- [`docs/guias/FLOW-PAGOS.md`](docs/guias/FLOW-PAGOS.md) - Sistema de pagos
- [`docs/guias/NGROK-SETUP.md`](docs/guias/NGROK-SETUP.md) - Tuneleo público
- [`docs/guias/EMAIL-SETUP.md`](docs/guias/EMAIL-SETUP.md) - Notificaciones por email
- [`docs/guias/ADMINISTRADOR.md`](docs/guias/ADMINISTRADOR.md) - Panel de admin

---

## 🏗️ DOCUMENTACIÓN TÉCNICA

### Arquitectura y API

- [`docs/api/ARQUITECTURA.md`](docs/api/ARQUITECTURA.md) - Estructura general
- [`docs/api/ENDPOINTS.md`](docs/api/ENDPOINTS.md) - Endpoints REST
- [`docs/api/MODELOS.md`](docs/api/MODELOS.md) - Modelos de BD

### Para Desarrolladores

- [`docs/desarrollo/ESTRUCTURA.md`](docs/desarrollo/ESTRUCTURA.md) - Carpetas del proyecto
- [`docs/desarrollo/GUIA-CODIGO.md`](docs/desarrollo/GUIA-CODIGO.md) - Cómo contribuir
- [`docs/desarrollo/TESTING.md`](docs/desarrollo/TESTING.md) - Tests

---

## 📁 ESTRUCTURA DE CARPETAS

```
amanwal/
├── docs/                      ← 📚 TODA LA DOCUMENTACIÓN
│   ├── inicio/               ← 🚀 Empieza aquí
│   │   ├── 00-BIENVENIDA.md
│   │   ├── 01-INICIO-RAPIDO.md
│   │   ├── 02-INSTALACION-COMPLETA.md
│   │   └── 03-CONFIGURACION-ENV.md
│   │
│   ├── guias/                ← 🔧 Guías específicas
│   │   ├── FLOW-PAGOS.md
│   │   ├── NGROK-SETUP.md
│   │   ├── EMAIL-SETUP.md
│   │   └── ADMINISTRADOR.md
│   │
│   ├── api/                  ← 🏗️ Documentación técnica
│   │   ├── ARQUITECTURA.md
│   │   ├── ENDPOINTS.md
│   │   └── MODELOS.md
│   │
│   └── desarrollo/           ← 👨‍💻 Para desarrolladores
│       ├── ESTRUCTURA.md
│       ├── GUIA-CODIGO.md
│       └── TESTING.md
│
├── backend/                  ← API Node.js
├── frontend/                 ← App React
├── README.md                 ← Overview general
└── INDICE.md                 ← Este archivo
```

---

## 🎯 BUSCAR POR TAREA

**¿Quieres hacer algo específico?**

### 🚀 Empezar el Proyecto
→ [`docs/inicio/01-INICIO-RAPIDO.md`](docs/inicio/01-INICIO-RAPIDO.md)

### 💳 Integrar Pagos
→ [`docs/guias/FLOW-PAGOS.md`](docs/guias/FLOW-PAGOS.md)

### 🌐 Configurar ngrok
→ [`docs/guias/NGROK-SETUP.md`](docs/guias/NGROK-SETUP.md)

### 📧 Configurar Emails
→ [`docs/guias/EMAIL-SETUP.md`](docs/guias/EMAIL-SETUP.md)

### 👥 Usar Panel Admin
→ [`docs/guias/ADMINISTRADOR.md`](docs/guias/ADMINISTRADOR.md)

### 📝 Entender Endpoints
→ [`docs/api/ENDPOINTS.md`](docs/api/ENDPOINTS.md)

### 💻 Desarrollar Nuevo Feature
→ [`docs/desarrollo/GUIA-CODIGO.md`](docs/desarrollo/GUIA-CODIGO.md)

### 🧪 Ejecutar Tests
→ [`docs/desarrollo/TESTING.md`](docs/desarrollo/TESTING.md)

---

## 🏃 QUICK START

```bash
# 1. Instalar
cd backend && npm install
cd ../frontend && npm install

# 2. Iniciar
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 3. Abre navegador
http://localhost:5173
```

---

## 🔑 VARIABLES DE ENTORNO

```bash
# backend/.env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta
FLOW_API_KEY=tu_api_key
FLOW_SECRET_KEY=tu_secret
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_app
```

Ver: [`docs/inicio/03-CONFIGURACION-ENV.md`](docs/inicio/03-CONFIGURACION-ENV.md)

---

## 🆘 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| Port 3000 in use | Ver `docs/inicio/02-INSTALACION-COMPLETA.md` |
| Cannot find module | Ejecutar `npm install` |
| BD corrupta | Eliminar `dev.db` y correr migraciones |
| Frontend no conecta | Verificar backend en puerto 3000 |
| Email no llega | Verificar SMTP en `docs/guias/EMAIL-SETUP.md` |

---

## ✨ CARACTERÍSTICAS

```
✅ Autenticación con JWT
✅ Listado de cabañas
✅ Reservas con calendario
✅ Pagos con Flow
✅ Panel de administrador
✅ Búsqueda y filtrado
✅ Paginación
✅ Notificaciones por email
✅ Confirmación automática
```

---

## 📞 CONTACTO Y SOPORTE

1. Revisa la documentación en `docs/`
2. Busca en archivos de guías
3. Revisa los logs en terminal

---

## 📊 ESTADO DEL PROYECTO

```
🟢 Producción Ready
✅ Todas las funcionalidades principales implementadas
✅ Sistema de pagos funcionando
✅ Panel de administrador completo
✅ Notificaciones por email
```

---

## 🎓 ARCHIVOS ANTIGUOS (En raíz)

Para referencia, estos archivos siguen disponibles:
- `README.md` - Overview general
- `ARQUITECTURA.md` - Endpoints (también en docs/api/)
- `CHECKLIST.md` - Tareas completadas
- `EJEMPLOS_API.md` - Ejemplos de uso
- `QUICKSTART.md` - Inicio rápido (también en docs/inicio/)

---

## 🚀 ¡EMPECEMOS!

1. **Si es tu primera vez**: [`docs/inicio/00-BIENVENIDA.md`](docs/inicio/00-BIENVENIDA.md)
2. **Si quieres empezar rápido**: [`docs/inicio/01-INICIO-RAPIDO.md`](docs/inicio/01-INICIO-RAPIDO.md)
3. **Si necesitas ayuda**: Busca en `docs/guias/`

---

**Happy Coding! 🎉**

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0 - Reorganizado  
**Status**: 🟢 Completo
