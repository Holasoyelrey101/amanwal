# 🖥️ Guía Específica: Instalación en VPS OVH

## 📋 Resumen de Cambios en VPS

Los cambios de código **ya están listos**. Solo necesitas:

1. Instalar dependencias NPM (`multer`, `sharp`)
2. Crear carpeta de permisos
3. Reiniciar la aplicación

**NO necesitas:**
- ❌ Editar archivos TypeScript
- ❌ Cambiar configuración
- ❌ Modificar BD
- ❌ Hacer git pull de nuevo

---

## 🚀 Pasos en VPS (Paso a Paso)

### PASO 1: Conectar por SSH

```bash
ssh root@tu_ip_vps
# o tu usuario habitual
```

### PASO 2: Navegar al proyecto

```bash
cd /root/amanwal
# O donde tengas tu proyecto
```

### PASO 3: Actualizar código (opcional)

Si los cambios aún no están en el VPS:

```bash
git pull origin main
```

### PASO 4: Instalar dependencias

```bash
cd backend
npm install multer sharp @types/multer
```

**⏰ IMPORTANTE:** Sharp tarda 2-3 minutos compilando.
```
> sharp@latest postinstall
> npm run install

npm WARN optional optional SKIPPED: @swc/core-linux-musl-x64

> sharp@0.33.X node install.js

Downloading https://github.com/lovell/sharp-libvips/releases/download/v8.13.0/libvips-8.13.0-linux-x64.tar.gz
...
✓ Package installation successful
```

**Espera a que termine sin errores.**

### PASO 5: Crear carpeta de uploads

```bash
mkdir -p /root/amanwal/backend/uploads/cabins
chmod 755 /root/amanwal/backend/uploads
chmod 755 /root/amanwal/backend/uploads/cabins
```

**Verifica que se creó:**
```bash
ls -la /root/amanwal/backend/uploads/cabins/
# Debería ser vacío pero con permisos 755
```

### PASO 6: Reiniciar la aplicación

#### Si usas PM2:

```bash
pm2 list
# Ver cuál es tu app (busca "amanwal" o similar)

pm2 restart amanwal-backend
# O:
pm2 restart 0  # (si es el app 0)

# Verificar logs
pm2 logs amanwal-backend
```

#### Si usas systemd:

```bash
sudo systemctl restart amanwal
```

#### Si ejecutas manualmente:

```bash
cd /root/amanwal/backend
npm run dev
```

### PASO 7: Verificar que está funcionando

```bash
# Health check
curl http://localhost:3000/api/health
# Debería retornar: {"status":"OK","timestamp":"..."}

# Verificar que sirve estáticos
curl http://tu_ip:3000/uploads/
# Debería listar la carpeta (o error 404 si está vacío)
```

---

## ✅ Verificación Completa

### Chequeo 1: Dependencias instaladas

```bash
cd /root/amanwal/backend
npm list multer sharp @types/multer

# Debería mostrar:
# amanwal-backend@1.0.0
# ├── @types/multer@1.4.7
# ├── multer@1.4.5-lts.1
# └── sharp@0.33.X
```

### Chequeo 2: Carpeta con permisos

```bash
ls -la /root/amanwal/backend/uploads/cabins/

# Debería mostrar:
# drwxr-xr-x  2 root root 4096 Dec  4 xx:xx cabins
# (permisos 755 ✓)
```

### Chequeo 3: Servidor respondiendo

```bash
curl -s http://localhost:3000/api/health | grep -o "OK"
# Debería imprimir: OK
```

### Chequeo 4: Logs sin errores

```bash
# Si usas PM2:
pm2 logs amanwal-backend | grep -i error
# NO debería mostrar nada sobre multer/sharp

# Si usas systemd:
sudo journalctl -u amanwal -n 50
```

---

## 🧪 Probar Upload en VPS

1. **Abre tu navegador**
   - Ve a: `http://tu_ip_vps:puerto`
   - Login como Admin

2. **Admin > Agregar Cabaña**

3. **Sube una imagen**

4. **Verifica en terminal VPS**
   ```bash
   ls -la /root/amanwal/backend/uploads/cabins/
   # Debería ver: cabin-1733347200000-*.webp
   ```

5. **Abre F12 en navegador**
   - Network > Busca "upload-images"
   - Debería ver Status 200

---

## 🔧 Solución de Problemas en VPS

### Problema: "npm ERR! 404 Not Found"

**Causa:** NPM registry down o problemas de conexión

**Solución:**
```bash
npm cache clean --force
npm install multer sharp @types/multer --no-optional
```

---

### Problema: "error: sharp: cannot run binary"

**Causa:** Sharp no se compiló correctamente

**Solución:**
```bash
# Instalar herramientas de compilación
sudo apt-get update
sudo apt-get install build-essential python3

# Reinstalar sharp
npm uninstall sharp
npm install sharp --build-from-source
```

---

### Problema: "Error: EACCES: permission denied, mkdir '/uploads'"

**Causa:** Sin permisos para crear carpeta

**Solución:**
```bash
# Asegurarse que tienes permisos
sudo mkdir -p /root/amanwal/backend/uploads/cabins
sudo chmod 755 /root/amanwal/backend/uploads
sudo chmod 755 /root/amanwal/backend/uploads/cabins
sudo chown -R root:root /root/amanwal/backend/uploads
```

---

### Problema: "Sharp installation failed"

**Causa:** Falta de dependencias del sistema

**Solución (Ubuntu/Debian):**
```bash
sudo apt-get install \
  build-essential \
  python3 \
  libvips-dev \
  libvips42

npm install sharp
```

**Solución (CentOS/RHEL):**
```bash
sudo yum install \
  gcc \
  g++ \
  make \
  python3 \
  vips-devel

npm install sharp
```

---

### Problema: "Las imágenes no se ve en el navegador"

1. **Verificar que archivos existen:**
   ```bash
   ls -la /root/amanwal/backend/uploads/cabins/
   ```

2. **Verificar permisos:**
   ```bash
   chmod 755 /root/amanwal/backend/uploads/cabins/
   chmod 644 /root/amanwal/backend/uploads/cabins/*
   ```

3. **Probar URL directamente:**
   ```bash
   curl http://tu_ip:3000/uploads/cabins/cabin-xxx.webp \
     -o test.webp
   # Si descarga, está bien. Si 404, hay problema.
   ```

---

### Problema: "PM2 no reinicia"

```bash
# Ver qué hay en PM2
pm2 list

# Si no está:
pm2 start /root/amanwal/backend/src/server.ts --name amanwal-backend

# Si está pero no reinicia:
pm2 stop amanwal-backend
pm2 delete amanwal-backend
pm2 start /root/amanwal/backend/dist/server.js --name amanwal-backend

# Guardar lista de PM2
pm2 save
pm2 startup
```

---

## 📊 Verificación de Espacio

Asegúrate que tienes espacio para las imágenes:

```bash
# Ver espacio en disco
df -h /root/

# Ver tamaño de carpeta
du -sh /root/amanwal/backend/uploads/

# Deberías tener al menos 10 GB libres
```

---

## 🔄 Nginx/Reverse Proxy (si aplica)

Si usas Nginx como reverse proxy, asegúrate que sirve estáticos:

```nginx
server {
    listen 80;
    server_name tu_dominio.com;

    # Servir imágenes directamente
    location /uploads/ {
        root /root/amanwal/backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API al backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend React
    location / {
        proxy_pass http://localhost:5173;  # O tu puerto frontend
    }
}
```

**Reiniciar Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎯 Checklist Final VPS

- [ ] Conecté por SSH
- [ ] Navegué a `/root/amanwal`
- [ ] Corrí `npm install multer sharp @types/multer`
- [ ] Esperé 2-3 minutos a que compilara (sin errores)
- [ ] Creé carpeta: `mkdir -p uploads/cabins`
- [ ] Di permisos: `chmod 755 uploads/cabins`
- [ ] Reinicié app (PM2/systemd)
- [ ] Probé: `curl http://localhost:3000/api/health`
- [ ] Subí imagen en admin (browser)
- [ ] Vi archivo en: `/root/amanwal/backend/uploads/cabins/`
- [ ] Imagen se ve en página

---

## 🚀 Resumen Rápido (Copy-Paste)

```bash
# Conectar
ssh root@tu_ip

# Instalar
cd /root/amanwal/backend
npm install multer sharp @types/multer

# Esperar ~2-3 minutos

# Permisos
mkdir -p /root/amanwal/backend/uploads/cabins
chmod 755 /root/amanwal/backend/uploads/cabins

# Reiniciar
pm2 restart amanwal-backend

# Verificar
curl http://localhost:3000/api/health
```

---

**Si todo funciona en VPS, ¡felicidades! 🎉**

El sistema de imágenes WebP está **100% funcional y optimizado** en producción.

