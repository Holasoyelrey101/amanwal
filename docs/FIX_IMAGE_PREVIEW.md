# 🔧 FIX REQUERIDO: Configurar Nginx para servir imágenes subidas

## Problema Identificado ❌
Las imágenes subidas desde el PC en los modales de crear/editar cabañas no se muestran.

### Causa 🔍
Nginx no tiene una ruta configurada para servir archivos desde `/uploads/`. Solo proxea `/api/` al backend Node.js.

### Síntomas 📋
- Preview text shows "Preview 1", "Preview 2" pero sin imágenes
- URLs como `/uploads/cabins/cabin-xxx.webp` devuelven 404
- Los archivos SÍ se guardan en el servidor (en `/var/www/amanwal/backend/uploads/cabins/`)

## Solución 🔧

### Paso 1: Actualizar configuración de Nginx

En el VPS, ejecutar:

```bash
sudo cp /etc/nginx/sites-enabled/amanwal /etc/nginx/sites-enabled/amanwal.backup

# Copiar la nueva configuración
sudo tee /etc/nginx/sites-enabled/amanwal > /dev/null << 'EOF'
# Ver nginx.conf en la raíz del proyecto
EOF

# O simplemente copiar desde el repo:
sudo cp nginx.conf /etc/nginx/sites-enabled/amanwal
```

### Paso 2: Validar configuración

```bash
sudo nginx -t
```

Debe devolver:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test passed
```

### Paso 3: Recargar Nginx

```bash
sudo systemctl reload nginx
```

## Cambios en nginx.conf

La nueva configuración agrega esta sección ANTES de `location /api/`:

```nginx
# Servir imágenes subidas desde /uploads/
location /uploads/ {
    alias /var/www/amanwal/backend/uploads/;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Qué hace:
- ✅ Ruta `/uploads/` se sirve directamente desde el filesystem (no proxeada)
- ✅ Cache de 30 días para imágenes
- ✅ Headers de seguridad

## Verificación ✅

Después de hacer estos cambios:

1. Sube una imagen desde PC en un modal
2. Abre DevTools (F12) → Network
3. Busca una request a `/uploads/cabins/cabin-xxx.webp`
4. Debe devolver **200 OK** (no 404)
5. La imagen debe verse en el preview

## Archivos Relacionados 📁

- `nginx.conf` - Configuración actualizada
- `backend/src/config/imageUpload.ts` - Maneja la conversión a WebP
- `frontend/src/components/AddCabinModal.tsx` - Frontend para subir imágenes
- `backend/src/routes/upload.routes.ts` - Endpoint de upload
