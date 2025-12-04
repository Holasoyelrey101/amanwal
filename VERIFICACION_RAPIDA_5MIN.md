# ⚡ Verificación Rápida (5 minutos)

## 🎯 Objetivo
Verificar que el sistema de imágenes WebP se instaló correctamente

---

## Paso 1: Verificar archivos (30 segundos)

```bash
# Backend config creado
test -f backend/src/config/imageUpload.ts && echo "✅ Config creada" || echo "❌ Config no existe"

# Backend routes creado
test -f backend/src/routes/upload.routes.ts && echo "✅ Routes creadas" || echo "❌ Routes no existe"

# Carpeta uploads creada
test -d backend/uploads/cabins && echo "✅ Carpeta creada" || echo "❌ Carpeta no existe"
```

---

## Paso 2: Instalar dependencias (3 minutos)

```bash
cd backend
npm install multer sharp @types/multer
```

**Espera a que termine. Sharp tarda ~2-3 min compilando.**

---

## Paso 3: Iniciar servidor (1 minuto)

```bash
npm run dev

# Deberías ver:
# 🚀 Server running on http://localhost:3000
```

---

## Paso 4: Probar en Navegador (30 segundos)

1. **Abre:** http://localhost:3000
2. **Login como Admin**
3. **Ve a:** Admin > Agregar Cabaña
4. **Sube una foto**
5. **Debería ver:** Foto agregada a la lista

---

## Paso 5: Verificar en F12 (1 minuto)

1. **Abre F12** (Ctrl+Shift+I)
2. **Ve a tab "Network"**
3. **Sube una foto nuevamente**
4. **Busca request:** `upload-images`
5. **Verifica:**
   - ✅ Status: 200
   - ✅ Content-Type: multipart/form-data
   - ✅ Response contiene: `imageUrls`

---

## Paso 6: Verificar Archivos Guardados (30 segundos)

```bash
# En otra terminal (mientras servidor está corriendo)
ls -lah backend/uploads/cabins/

# Debería ver archivos como:
# cabin-1733347200000-123456789.webp
# cabin-1733347205000-987654321.webp
```

---

## Paso 7: Crear Cabaña Completa (2 minutos)

1. **Sigue en Admin > Agregar Cabaña**
2. **Rellena todos los datos**
3. **Sube foto**
4. **Click "Crear Cabaña"**
5. **Debería crearse sin errores**

---

## Paso 8: Ver Lista de Cabañas (1 minuto)

1. **Ve a:** Cabanas > Lista
2. **Debería verse la foto**
3. **Abre F12 > Network**
4. **Busca:** requests a `/uploads/cabins/`
5. **Verifica:** Se descargan como `.webp`

---

## ✅ Resultado Final

Si todos los pasos pasaron:

```
✅ Archivos creados
✅ Dependencias instaladas
✅ Servidor corriendo
✅ Upload funciona
✅ WebP se genera
✅ Imágenes se guardan
✅ Frontend las muestra
✅ F12 muestra URLs normales (no base64)
```

**¡Sistema completamente funcional!** 🎉

---

## ❌ Si algo falló

### Error: "Cannot find module 'multer'"
```bash
npm install multer sharp @types/multer
```

### Error: Sharp falla al compilar
```bash
npm install sharp --build-from-source
```

### No ve archivos en `/uploads/cabins/`
```bash
mkdir -p backend/uploads/cabins
chmod 755 backend/uploads/cabins
```

### La foto no carga en la página
1. Abre F12 > Console (pestana "Console")
2. Verifica si hay errores rojos
3. Puede ser problema de navegador (limpiar caché)

---

## 📊 Comparación: Antes vs Después (en F12)

### ANTES ❌ (Base64)
```
Network > Image loaded in JSON
Request URL: /api/cabins
Response: { images: ["data:image/jpeg;base64,..."] }
Size: 5 MB
```

### DESPUÉS ✅ (WebP + URL)
```
Network > cabin-xxx.webp
Request URL: /uploads/cabins/cabin-xxx.webp
Type: image/webp
Size: 500 KB
Cache: Si
```

---

## 🎯 Próximos Pasos

### Si TODO funcionó ✅
→ Pasar a instalación en **VPS**
Ver: `INSTALACION_VPS_IMAGENES_WEBP.md`

### Si algo falló ❌
→ Ver sección de troubleshooting:
Ver: `SETUP_IMAGENES_WEBP_COMPLETADO.md`

---

## 💡 Tips Útiles

### Ver logs del servidor
```bash
# En el terminal donde corre npm run dev
# (los logs aparecen automáticamente)
```

### Probar upload con curl

```bash
# En otra terminal
curl -F "images=@tu_foto.jpg" \
     http://localhost:5000/api/upload/upload-images
```

### Limpiar caché navegador
```
F12 > Network > ☑ Disable cache
(mientras F12 esté abierto)
```

---

## ⏱️ Tiempo Total Estimado

- Verificación de archivos: 30 segundos
- Instalar dependencias: 3 minutos
- Pruebas en navegador: 2 minutos
- **Total: ~6 minutos**

---

**¡Éxito!** 🚀

