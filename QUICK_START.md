# ⚡ QUICK START: 5 Pasos para Activar WebP

## Paso 1: Instalar Dependencias (3 minutos)

```bash
cd c:\Users\usuario\Desktop\amanwal\backend
npm install multer sharp @types/multer
```

Espera a que Sharp compile (verás mensajes de descarga). Es normal que tarde 2-3 minutos.

---

## Paso 2: Iniciar Servidor

```bash
npm run dev
```

Deberías ver:
```
🚀 Server running on http://localhost:3000
```

---

## Paso 3: Probar en Navegador

1. Abre: **http://localhost:3000**
2. Login como Admin
3. Ve a: **Admin > Agregar Cabaña**
4. Sube una foto
5. ✅ Debería agregar la foto sin problemas

---

## Paso 4: Verificar en F12

1. Abre **F12** (Ctrl+Shift+I)
2. Ve a tab **Network**
3. Sube una foto nuevamente
4. Busca request: **upload-images**
5. Verifica:
   - Status: 200 ✅
   - Response: `{ imageUrls: ["/uploads/cabins/cabin-xxx.webp"] }` ✅

---

## Paso 5: Verificar Archivos

En otra terminal:
```bash
dir c:\Users\usuario\Desktop\amanwal\backend\uploads\cabins\
```

Deberías ver archivos `.webp` tipo:
```
cabin-1733347200000-123456789.webp
cabin-1733347205000-987654321.webp
```

---

## ✅ ¡Listo!

Tu sistema de imágenes ahora es como el de Expedia:
- ✅ WebP (10x más pequeño)
- ✅ URLs normales (no base64)
- ✅ Caché en navegador
- ✅ Rápido

---

## 🚀 Instalar en VPS

Cuando estés listo:

```bash
ssh root@tu_ip
cd /root/amanwal/backend
npm install multer sharp @types/multer
mkdir -p uploads/cabins && chmod 755 uploads/cabins
pm2 restart amanwal-backend
```

---

## ❌ Si Algo Falla

**Error: "Cannot find module 'multer'"**
```bash
npm install multer sharp @types/multer
```

**Sharp no compila**
```bash
npm install sharp --build-from-source
```

**Más problemas:** Lee `SETUP_IMAGENES_WEBP_COMPLETADO.md`

---

## 📞 Resumen de Cambios

- ✅ Backend: Recibe archivos, convierte a WebP
- ✅ Frontend: Envía archivos (no base64)
- ✅ BD: Almacena URLs (no base64 gigante)
- ✅ Navegador: Cachea imágenes

---

**Tiempo total: ~5 minutos**

**Resultado: App como Expedia** 🎉

