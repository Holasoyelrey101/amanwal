# 🧪 Guía de Pruebas - Sistema WebP

## Pre-requisitos

Asegúrate de que tienes instalado:
- Node.js 16+
- npm
- Terminal/PowerShell

---

## ✅ PASO 1: Instalar Dependencias

### En tu máquina LOCAL

```bash
# Navega al backend
cd backend

# Instala las dependencias
npm install multer sharp @types/multer

# Debería completarse sin errores
# (Sharp puede tardar 1-2 minutos compilando)
```

**Verifica que se instaló:**
```bash
npm list multer sharp @types/multer
```

---

## ✅ PASO 2: Iniciar el Servidor

```bash
# En la carpeta backend
npm run dev

# Debería ver:
# 🚀 Server running on http://localhost:3000
```

---

## ✅ PASO 3: Probar Upload desde Admin

1. **Abre tu navegador**
   - Ve a: `http://localhost:3000` (o tu puerto frontend)
   - Login como Admin

2. **Navega a Admin > Agregar Cabaña** (o Editar Cabaña existente)

3. **Sube una imagen**
   - Haz clic en el input de archivos
   - Selecciona 1-3 imágenes (JPG, PNG, etc.)
   - La imagen debería convertirse a WebP

4. **Verifica en la consola del servidor**
   ```
   Debería ver algo como:
   ✅ Convertido: cabin-1733347200000-123456789.webp
   ```

---

## ✅ PASO 4: Verificar en F12 (DevTools)

### Network Tab

1. **Abre F12** (o `Ctrl+Shift+I`)

2. **Ve a la tab "Network"**

3. **Sube una imagen nuevamente**

4. **Busca la request** `upload-images`

5. **Verifica:**
   - ✅ Method: POST
   - ✅ URL: http://localhost:5000/api/upload/upload-images (o tu puerto)
   - ✅ Content-Type: multipart/form-data
   - ✅ Response Status: 200

6. **Mira la respuesta:**
   ```json
   {
     "success": true,
     "imageUrls": [
       "/uploads/cabins/cabin-1733347200000-123456789.webp"
     ]
   }
   ```

---

## ✅ PASO 5: Verificar que se Guardó

### Verificar Carpeta

1. **Abre explorador de archivos**
2. **Ve a:** `backend/uploads/cabins/`
3. **Debería ver** archivos `.webp` con nombres como:
   - `cabin-1733347200000-123456789.webp`
   - `cabin-1733347205000-987654321.webp`

### Verificar tamaño

```bash
# En terminal, ve a la carpeta y lista
ls -lah backend/uploads/cabins/

# Debería ver algo como:
# -rw-r--r-- cabin-1733347200000-123456789.webp (50K - 500K)
```

---

## ✅ PASO 6: Verificar Carga de Imagen

1. **Sube una cabaña con imagen** en Admin

2. **Abre la página de lista de cabañas**

3. **Abre F12 > Network**

4. **Recarga la página** (Ctrl+R)

5. **Busca una request a** `/uploads/cabins/cabin-*.webp`

6. **Verifica:**
   - ✅ Status: 200
   - ✅ Type: image/webp
   - ✅ La imagen se ve en la página

---

## ✅ PASO 7: Verificar en Detalle de Cabaña

1. **Haz clic en una cabaña** de la lista

2. **En la página de detalles, verifica:**
   - ✅ La imagen se ve
   - ✅ No hay errores en F12 Console

3. **Abre F12 > Network**

4. **Busca requests a** `/uploads/cabins/`

5. **Verifica que son archivos WebP reales**, no data URLs

---

## ✅ PASO 8: Comparar ANTES vs DESPUÉS

### Abrir BD (Prisma Studio)

```bash
# En terminal (mientras el servidor está corriendo)
npx prisma studio

# Se abrirá http://localhost:5555
```

1. **Ve a la tabla `Cabin`**

2. **Abre una cabaña con nuevas imágenes**

3. **Campo `images`:**
   - ✅ DESPUÉS: `["/uploads/cabins/cabin-xxx.webp"]`
   - ❌ ANTES: `["data:image/jpeg;base64,AAAA..."]`

---

## ❌ TROUBLESHOOTING

### Problema: "Error: Cannot find module 'multer'"

**Solución:**
```bash
npm install multer sharp @types/multer
npm run build
npm run dev
```

---

### Problema: "Error: Cannot create directory '/uploads'"

**Solución:**
```bash
# Crear carpeta manualmente
mkdir -p backend/uploads/cabins
```

---

### Problema: "Error converting image"

**Posibles causas:**
1. Sharp no se instaló correctamente
2. Archivo corrupto
3. Permisos insuficientes

**Solución:**
```bash
# Reinstalar sharp
npm uninstall sharp
npm install sharp

# Si sigue fallando, construir desde código fuente
npm install sharp --build-from-source
```

---

### Problema: "Las imágenes no aparecen en el navegador"

**Verifica:**
```bash
# 1. Los archivos existen
ls -la backend/uploads/cabins/

# 2. El servidor sirve estáticos
curl http://localhost:5000/uploads/cabins/cabin-xxx.webp
# Debería descargar la imagen

# 3. Los permisos están bien
chmod 755 backend/uploads/cabins/
```

---

### Problema: "En F12 sigo viendo data:image/jpeg;base64"

**Causa:** Las imágenes antiguas aún están en BD

**Solución:**
```bash
# Ejecutar script de migración
cd backend
npx ts-node scripts/convertOldImagesToWebP.ts
```

---

## 🎯 Checklist Final

- [ ] ✅ Instalé `multer`, `sharp`, `@types/multer`
- [ ] ✅ El servidor inicia sin errores
- [ ] ✅ Puedo subir imágenes en Admin
- [ ] ✅ Las imágenes se convierten a WebP
- [ ] ✅ En F12/Network veo requests a `/uploads/cabins/`
- [ ] ✅ En Prisma Studio veo URLs, no base64
- [ ] ✅ Las imágenes se ven en la página
- [ ] ✅ Las imágenes se cachean (segunda carga es rápida)

---

## 📊 Resultados Esperados

### Velocidad

| Métrica | Antes | Después |
|---------|-------|---------|
| Tamaño imagen (antes procesar) | 5 MB | 5 MB |
| Tamaño tras WebP | 5 MB (base64) | 500 KB (WebP) |
| Tiempo primer load | Lento (descarga JSON) | Rápido (JSON pequeño) |
| Tiempo segundo load | Lento (sin caché) | Muy rápido (caché) |

### BD

| Métrica | Antes | Después |
|---------|-------|---------|
| 1 imagen en BD | 6.7 MB | 30 bytes |
| 10 imágenes en BD | 67 MB | 300 bytes |

---

## 🚀 Próximo Paso: Instalar en VPS

Una vez que todo funciona en LOCAL, sigue la guía:
📄 **Ver: `INSTALACION_IMAGENES_WEBP.md`** (sección "Instalación en VPS")

