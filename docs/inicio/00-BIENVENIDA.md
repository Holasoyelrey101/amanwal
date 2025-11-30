# 🏠 Bienvenido a AMANWAL

Plataforma completa de reserva y gestión de cabañas de lujo con sistema de pagos integrado.

---

## 📁 Estructura de Documentación

```
docs/
├── inicio/              ← Empezar aquí
│   ├── 00-BIENVENIDA.md (este archivo)
│   ├── 01-INICIO-RAPIDO.md
│   ├── 02-INSTALACION-COMPLETA.md
│   └── 03-CONFIGURACION-ENV.md
│
├── guias/               ← Guías específicas
│   ├── NGROK-SETUP.md
│   ├── FLOW-PAGOS.md
│   ├── EMAIL-SETUP.md
│   └── ADMINISTRADOR.md
│
├── api/                 ← Documentación técnica
│   ├── ARQUITECTURA.md
│   ├── ENDPOINTS.md
│   └── MODELOS.md
│
└── desarrollo/          ← Para desarrolladores
    ├── ESTRUCTURA.md
    ├── GUIA-CODIGO.md
    └── TESTING.md
```

---

## 🚀 Cómo Empezar

### 1. Primera Vez (5 minutos)

1. Lee: `01-INICIO-RAPIDO.md`
2. Ejecuta: `.\start.bat` (Windows) o `./start.sh` (Mac/Linux)
3. Abre: `http://localhost:5173`

### 2. Instalación Completa (15 minutos)

Si el script automático no funciona:

1. Lee: `02-INSTALACION-COMPLETA.md`
2. Sigue los pasos paso a paso
3. Verifica en: `http://localhost:5173`

### 3. Configurar Pagos (10 minutos)

Para hacer funcionar el sistema de pagos:

1. Crea cuenta en [Flow.cl](https://www.flow.cl)
2. Lee: `FLOW-PAGOS.md` (en carpeta `guias/`)
3. Configura ngrok: `NGROK-SETUP.md`
4. Prueba un pago

### 4. Configurar Emails (5 minutos)

Para recibir confirmaciones por email:

1. Lee: `EMAIL-SETUP.md` (en carpeta `guias/`)
2. Configura tu email en `.env`
3. Prueba enviando una reserva

---

## 🎯 Roadmap de Documentación

```
📍 Estoy Aquí
├── 🟢 HECHO - Autenticación
├── 🟢 HECHO - Listado de cabañas
├── 🟢 HECHO - Sistema de reservas
├── 🟢 HECHO - Pagos con Flow
├── 🟢 HECHO - Panel de administrador
├── 🟢 HECHO - Notificaciones por email
└── 🟡 EN PROGRESO - Más características
```

---

## 💡 Atajos Rápidos

**¿Necesitas...?**

- ⚡ Empezar rápido → `01-INICIO-RAPIDO.md`
- 🔧 Instalación paso a paso → `02-INSTALACION-COMPLETA.md`
- 💳 Integrar Flow → `docs/guias/FLOW-PAGOS.md`
- 🌐 Usar ngrok → `docs/guias/NGROK-SETUP.md`
- 📧 Configurar emails → `docs/guias/EMAIL-SETUP.md`
- 👨‍💼 Panel admin → `docs/guias/ADMINISTRADOR.md`
- 🏗️ Entender arquitectura → `docs/api/ARQUITECTURA.md`
- 💻 Desarrollar → `docs/desarrollo/GUIA-CODIGO.md`

---

## 📊 Estado del Proyecto

```
✅ Autenticación
✅ Registro de usuarios
✅ Listado de cabañas
✅ Creación de reservas
✅ Calendario de disponibilidad
✅ Pagos con Flow
✅ Panel de administrador
✅ Búsqueda y filtrado
✅ Paginación
✅ Confirmación automática de pagos
✅ Notificaciones por email
✅ Gestión de reservas
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Port already in use" | Ver `02-INSTALACION-COMPLETA.md` |
| "Cannot find module" | Ejecutar `npm install` nuevamente |
| "BD corrupta" | Eliminar `dev.db` y correr migraciones |
| "Frontend no conecta" | Verificar backend en puerto 3000 |
| "Email no llega" | Configurar SMTP en `EMAIL-SETUP.md` |

---

## 📚 Archivos Raíz Antiguos

Si buscas la documentación antigua en la raíz:

- `README.md` → Overview general
- `ARQUITECTURA.md` → Endpoints API
- `CHECKLIST.md` → Tareas completadas
- `EJEMPLOS_API.md` → Ejemplos de uso

Ahora todo está organizado en `docs/` para mejor orden.

---

## ✨ Características Principales

🏠 **Sistema de Reservas**
- Calendario interactivo
- Cálculo automático de precios
- Estados de reserva (pendiente, confirmada, cancelada)

💳 **Pagos Integrados**
- Flow (pasarela chilena)
- Confirmación automática
- Histórico de pagos

👥 **Panel de Administrador**
- Gestión de cabañas
- Gestión de usuarios
- Gestión de reservas
- Búsqueda y filtrado

📧 **Notificaciones**
- Email de confirmación
- Email de cancelación
- Alertas administrativas

---

## 🚀 ¡Empecemos!

```bash
# Opción 1: Automático (más fácil)
.\start.bat

# Opción 2: Manual
cd backend && npm run dev
# En otra terminal:
cd frontend && npm run dev

# Luego abre:
# http://localhost:5173
```

---

## 📞 Contacto y Soporte

- 📖 Revisa la documentación en `docs/`
- 🔍 Busca en los archivos de guías
- 💬 Revisa los logs en la terminal

---

**Happy Coding! 🎉**

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0 - Completa  
**Estado**: 🟢 Producción Ready
