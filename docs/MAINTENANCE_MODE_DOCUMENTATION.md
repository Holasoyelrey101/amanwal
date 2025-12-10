# ✅ MODO MANTENIMIENTO - Implementación Completa

## 📋 Resumen

Se implementó un **sistema completo de modo mantenimiento** que permite:
- ✅ Mostrar página de mantenimiento a usuarios no autorizados
- ✅ Permitir acceso a administradores con token válido
- ✅ Panel de control para activar/desactivar modo
- ✅ Cookies persistentes para acceso de administrador
- ✅ Nginx intercepta todas las requests correctamente

---

## 🏗️ Arquitectura del Sistema

### 1. **Backend - Middleware de Mantenimiento**
**Archivo:** `backend/src/middleware/maintenance.middleware.ts`

```typescript
- Verifica si archivo `.maintenance` existe
- Lee token de: headers (`x-admin-token`), query (`?token=...`), cookies (`maintenanceToken`)
- Retorna 503 + maintenance.html si no está autorizado
- Retorna 503 JSON para requests de API
- Siempre permite: `/api/maintenance`, `/api/health`, `/maintenance.html`
```

### 2. **Backend - Rutas de Mantenimiento**
**Archivo:** `backend/src/routes/maintenance.routes.ts`

```
GET  /api/maintenance?token=...       → Estado del mantenimiento
POST /api/maintenance/enable?token=...  → Activar mantenimiento
POST /api/maintenance/disable?token=... → Desactivar mantenimiento
```

### 3. **Frontend - Panel de Control**
**Archivo:** `frontend/public/maintenance-panel.html`

- Interfaz hermosa con gradiente
- Botones: ACTIVAR, DESACTIVAR, VER ESTADO
- **Guarda automáticamente token en cookie** después de activación
- Acceso permanente: `/maintenance-panel.html`

### 4. **Página de Mantenimiento**
**Archivo:** `frontend/public/503.html` (copiada como `/maintenance.html`)

- Dark theme profesional
- Ícono animado (engranaje pulsante)
- Mensaje amigable en español
- Email de soporte

### 5. **Nginx - Reverse Proxy Inteligente**
**Archivo:** `/etc/nginx/sites-enabled/amanwal`

**Cambios clave:**
```nginx
# Antes: try_files $uri /index.html (Nginx servía archivos sin pasar por Express)

# Ahora: try_files $uri @backend (Primero intenta archivo, luego proxea al backend)
location @backend {
    proxy_pass http://backend;
    proxy_intercept_errors on;
    error_page 503 /maintenance.html;
}

# Nginx automáticamente sirve /maintenance.html cuando Express retorna 503
error_page 503 /maintenance.html;
```

---

## 🔑 Configuración de Producción

### Token de Administrador
```
ADMIN_MAINTENANCE_TOKEN=amanwal_maintenance_token_secreto_2025
```

Guardado en: `backend/.env` (VPS: `/var/www/amanwal/backend/.env`)

### Archivo de Control
```
/var/www/amanwal/backend/.maintenance
```

- **Existe** → Modo mantenimiento ACTIVO
- **No existe** → Modo mantenimiento INACTIVO

### Ubicación de Archivos en VPS
```
/var/www/amanwal/
├── maintenance.html                    ← Página que sirve Nginx
├── frontend/
│   ├── dist/                          ← React build
│   └── public/
│       ├── maintenance.html           ← Copia de 503.html
│       ├── maintenance-panel.html     ← Panel de control
│       └── 503.html                   ← Versión local
└── backend/
    ├── .maintenance                   ← Flag de activación
    ├── maintenance.html               ← Versión antigua (obsoleta)
    └── src/
        ├── middleware/maintenance.middleware.ts
        └── routes/maintenance.routes.ts
```

---

## 🚀 Cómo Usar

### 1. **Activar Modo Mantenimiento**

Opción A - Desde Panel Web:
```
1. Ir a: https://amanwal.com/maintenance-panel.html
2. Click en "ACTIVAR"
3. Se guarda token automáticamente en cookie
```

Opción B - Desde Terminal:
```bash
ssh ubuntu@148.113.205.47
cd /var/www/amanwal/backend
touch .maintenance
```

Opción C - Desde API:
```bash
curl -X POST "https://amanwal.com/api/maintenance/enable?token=amanwal_maintenance_token_secreto_2025"
```

### 2. **Ver Estado**
```bash
curl "https://amanwal.com/api/maintenance?token=amanwal_maintenance_token_secreto_2025"
```

Respuesta:
```json
{
  "success": true,
  "maintenance": {
    "enabled": true,
    "message": "Sistema en mantenimiento"
  }
}
```

### 3. **Desactivar Modo Mantenimiento**

Opción A - Desde Panel:
```
1. Ir a: https://amanwal.com/maintenance-panel.html
2. Click en "DESACTIVAR"
```

Opción B - Desde Terminal:
```bash
ssh ubuntu@148.113.205.47
rm /var/www/amanwal/backend/.maintenance
```

Opción C - Desde API:
```bash
curl -X POST "https://amanwal.com/api/maintenance/disable?token=amanwal_maintenance_token_secreto_2025"
```

---

## ✅ Flujo de Verificación

### Escenario 1: Usuario Normal (sin token)
```
1. Accede a: https://amanwal.com/
2. Nginx recibe request
3. No es archivo estático → proxea a Express (@backend)
4. Express ve .maintenance activo → retorna 503
5. Nginx intercepta 503 → sirve /maintenance.html
6. Usuario ve: "Enseguida volvemos. Estamos actualizando el sistema..."
```

### Escenario 2: Administrador (con token en cookie)
```
1. Accede a: https://amanwal.com/
2. Cookie incluye: maintenanceToken=amanwal_maintenance_token_secreto_2025
3. Express valida token → permite acceso
4. Usuario ve: Sitio normal funcionando
```

### Escenario 3: Administrador (sin cookies - incógnito)
```
1. Accede a: https://amanwal.com/maintenance-panel.html
2. Luego ingresa token
3. Panel hace request con ?token=... en query
4. Express valida → autoriza
5. Panel guarda en cookie para futuras requests
```

---

## 🔐 Seguridad

1. **Token almacenado en cookie httpOnly** (seguro contra XSS)
2. **Validación en Express middleware** (no confía en cliente)
3. **Múltiples métodos de validación:**
   - Headers: `x-admin-token: token`
   - Query params: `?token=...`
   - Cookies: `maintenanceToken=...`
4. **Rutas siempre permitidas:**
   - `/api/health` (health checks)
   - `/api/maintenance` (estado)
   - `/maintenance.html` (página)
   - `/maintenance-panel.html` (panel)

---

## 📊 Estructura de Código

### Express Server Setup
```typescript
// backend/src/server.ts
import cookieParser from 'cookie-parser';
app.use(cookieParser());
app.use(maintenanceMiddleware);
app.use('/api/maintenance', maintenanceRoutes);
```

### Middleware Workflow
```
Request → Cookie Parser → Maintenance Middleware → (Routes/Controllers)
                              ↓
                    ¿.maintenance existe?
                         ↓
                    ¿Token válido?
                      ↙     ↘
                    SÍ      NO
                    ↓       ↓
                  next() 503 + HTML
```

### Nginx Workflow
```
Request HTTPS → Static files? → Yes → Serve (js, css, images)
                    ↓ No
                  @backend → Express Middleware
                    ↓
                 Express → 503? → Nginx intercepts → Serve maintenance.html
                    ↓
                  200 OK → Serve to client
```

---

## 🐛 Troubleshooting

### Problema: Mantenimiento no aparece
```bash
# Verificar archivo existe
ssh ubuntu@148.113.205.47 "ls -la /var/www/amanwal/backend/.maintenance"

# Verificar Nginx
ssh ubuntu@148.113.205.47 "curl -s http://localhost:3001/api/health"

# Recargar Nginx
ssh ubuntu@148.113.205.47 "sudo nginx -t && sudo systemctl reload nginx"
```

### Problema: Administrador no puede acceder
```bash
# Verificar token en cookie
# En navegador DevTools → Application → Cookies → maintenanceToken

# Probar con token en query
curl "https://amanwal.com/?token=amanwal_maintenance_token_secreto_2025"

# Verificar middleware recibe token
# Agregar log en maintenance.middleware.ts
console.log('Token:', req.headers['x-admin-token'], req.query.token);
```

### Problema: Página mantenimiento 404
```bash
# Copiar archivo a ubicación correcta
ssh ubuntu@148.113.205.47 "sudo cp /var/www/amanwal/frontend/public/maintenance.html /var/www/amanwal/"

# Verificar permisos
ssh ubuntu@148.113.205.47 "ls -la /var/www/amanwal/maintenance.html"
```

---

## 📝 Archivos Modificados

1. ✅ `backend/src/middleware/maintenance.middleware.ts` - Creado
2. ✅ `backend/src/routes/maintenance.routes.ts` - Creado
3. ✅ `backend/src/server.ts` - Agregado cookie-parser
4. ✅ `backend/package.json` - cookie-parser agregado
5. ✅ `frontend/public/maintenance-panel.html` - Creado
6. ✅ `frontend/public/503.html` - Creado
7. ✅ `/etc/nginx/sites-enabled/amanwal` - Actualizado (NEW @backend location)
8. ✅ `.env` - ADMIN_MAINTENANCE_TOKEN

---

## 🎯 Próximos Pasos (Opcional)

1. Agregar página de mantenimiento con countdown timer
2. Notificaciones por email cuando se activa/desactiva
3. Historial de cambios de modo mantenimiento
4. Multiple tokens para diferentes administradores
5. Whitelist de IPs que pueden acceder durante mantenimiento

---

## 📞 Soporte

En caso de problemas:
1. Verificar logs: `tail -f /var/log/nginx/amanwal_error.log`
2. Revisar estado: `curl http://localhost:3001/api/health`
3. Comprobar PM2: `pm2 status`
4. Contactar: cabanasamanwal@gmail.com

---

**Última actualización:** 2025-12-10 04:30 UTC
**Estado:** ✅ FUNCIONAL
**Versión:** 1.0

