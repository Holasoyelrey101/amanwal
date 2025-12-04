# Instrucciones: Sistema de Subida de Imágenes (WebP Optimizado)

## ¿Qué cambió?

Ahora las imágenes:
- ✅ Se suben como archivos reales (no base64)
- ✅ Se convierten automáticamente a WebP
- ✅ Se sirven como URLs normales: `/uploads/cabins/imagen.webp`
- ✅ Se cachean en el navegador (mejor rendimiento)
- ✅ Pesan menos (compresión WebP)

## Instalación en LOCAL

### 1. Instalar dependencias en Backend

```bash
cd backend
npm install multer sharp @types/multer
```

### 2. Verificar cambios

Los siguientes archivos YA están creados:
- `backend/src/config/imageUpload.ts` ← Configuración de Multer
- `backend/src/routes/upload.routes.ts` ← Ruta para upload
- `backend/src/server.ts` ← Actualizado para servir /uploads
- `backend/uploads/cabins/` ← Carpeta para guardar imágenes
- `frontend/src/components/AddCabinModal.tsx` ← Actualizado
- `frontend/src/components/EditCabinModal.tsx` ← Actualizado

### 3. Probar Localmente

1. Reinicia el servidor backend
2. Ve a Admin > Agregar Cabaña
3. Sube una imagen
4. Abre el F12 > Network > busca "upload-images"
5. Verás que se envía como `multipart/form-data`
6. La respuesta será: `{ "imageUrls": ["/uploads/cabins/cabin-xxx.webp"] }`

### 4. Verificar en F12

Antes (❌):
```
Network > Imagen
Request URL: datos en JSON con "data:image/jpeg;base64,..."
```

Después (✅):
```
Network > cabin-xxx.webp
Request URL: http://localhost:5000/uploads/cabins/cabin-xxx.webp
Type: image/webp
```

---

## Instalación en VPS (OVH)

### 1. Conectar por SSH

```bash
ssh root@tu_ip_vps
```

### 2. Navegar al proyecto

```bash
cd /root/amanwal/backend
```

### 3. Instalar dependencias

```bash
npm install multer sharp @types/multer
```

> **Nota**: Sharp necesita compilar. Toma ~2-3 minutos. Espera a que termine.

### 4. Crear carpeta con permisos

```bash
mkdir -p /root/amanwal/backend/uploads/cabins
chmod 755 /root/amanwal/backend/uploads
chmod 755 /root/amanwal/backend/uploads/cabins
```

### 5. Reiniciar la aplicación

```bash
# Si usas PM2:
pm2 restart amanwal-backend

# O si la estás ejecutando manualmente:
npm run dev
```

### 6. Verificar que funciona

```bash
curl http://tu_ip_vps:3000/api/health
# Debería retornar: {"status":"OK","timestamp":"..."}
```

---

## Limpiar imágenes antiguas (Base64)

Si tienes cabañas con imágenes en base64, necesitas actualizar sus URLs.

**Opción 1: Descargar imágenes antiguas**

```bash
# En el terminal de tu máquina local:
node scripts/convertOldImagesToWebP.js
```

**Opción 2: Eliminar y volver a subir**

1. Admin > Editar Cabaña
2. Elimina las imágenes antiguas
3. Sube nuevas imágenes (ahora se guardan como WebP)

---

## Estructura de carpetas después

```
backend/
├── uploads/
│   └── cabins/
│       ├── cabin-1733347200000-123456789.webp
│       ├── cabin-1733347205000-987654321.webp
│       └── ...
├── src/
│   ├── config/
│   │   └── imageUpload.ts          ← NUEVO
│   ├── routes/
│   │   └── upload.routes.ts        ← NUEVO
│   └── server.ts                   ← MODIFICADO
```

---

## Solución de Problemas

### Error: "Cannot find module 'multer'"

```bash
npm install multer sharp @types/multer
npm run build
```

### Error: "ENOENT: no such file or directory, mkdir '/uploads'"

```bash
mkdir -p backend/uploads/cabins
chmod 755 backend/uploads
```

### Las imágenes no se ven en el navegador

1. Verifica que `/uploads/cabins/` tenga archivos:
   ```bash
   ls -la backend/uploads/cabins/
   ```

2. Verifica que el servidor esté sirviendo estáticos:
   ```bash
   curl http://localhost:5000/uploads/cabins/cabin-xxx.webp
   # Debería descargar la imagen
   ```

3. Verifica en la BD que las URLs sean `/uploads/cabins/...` y no `data:image`

### Sharp falla en compilar en VPS

Sharp necesita build tools. Instala:

```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3

# Y luego reinstala:
npm install sharp --build-from-source
```

---

## URLs de referencia

- Multer docs: https://github.com/expressjs/multer
- Sharp docs: https://sharp.pixelplumbing.com/
- WebP format: https://developers.google.com/speed/webp

