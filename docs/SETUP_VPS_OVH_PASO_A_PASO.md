# 🚀 SETUP VPS OVH - Guía Paso a Paso Completa

**Fecha:** 2 de Diciembre 2025  
**VPS:** OVH VPS-1 (4 vCore, 8GB RAM, 75GB SSD)  
**OS:** Ubuntu 25.04 (cambiar a 22.04 LTS si está disponible)  
**Dominio:** amanwal.com  
**App:** Node.js Backend + React Frontend

---

# FASE 1: ACCEDER AL VPS (5 minutos)

## Paso 1: Obtener credenciales OVH

1. Entra a https://www.ovh.com/auth/
2. Inicia sesión con tu cuenta
3. Busca tu VPS en el panel de control
4. Deberías ver:
   - **IP del servidor** (ej: `123.45.67.89`)
   - **Usuario:** `root`
   - **Contraseña:** (enviada por email)

## Paso 2: Conectar por SSH (Windows)

**Opción A: Usar PowerShell (Recomendado)**

```powershell
# Reemplaza con tu IP
ssh root@123.45.67.89

# Cuando pida contraseña, pega la que recibiste de OVH
```

**Opción B: Usar PuTTY (si PowerShell no funciona)**
- Descargar: https://www.putty.org/
- Host: `123.45.67.89`
- Puerto: `22`
- Usuario: `root`

---

# FASE 2: CONFIGURACIÓN INICIAL DEL SERVIDOR (10 minutos)

## Paso 3: Actualizar sistema

Una vez conectado por SSH:

```bash
# Actualizar repositorios
sudo apt update

# Actualizar paquetes
sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git nano htop
```

## Paso 4: Cambiar contraseña root (IMPORTANTE)

```bash
passwd

# Te pedirá contraseña actual (pega la de OVH)
# Luego ingresa contraseña nueva (MUY SEGURA)
# Confirma la contraseña
```

## Paso 5: Crear usuario no-root (Seguridad)

```bash
# Crear usuario (reemplaza 'walter' con tu nombre)
sudo useradd -m -s /bin/bash walter

# Asignar contraseña
sudo passwd walter

# Darle permisos de sudo
sudo usermod -aG sudo walter

# Verificar que funciona
su - walter
sudo whoami  # Debe decir "root"
```

---

# FASE 3: INSTALAR DEPENDENCIAS (15 minutos)

## Paso 6: Instalar Node.js v20

```bash
# Descargar script de NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

## Paso 7: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar estado
sudo systemctl status postgresql
```

## Paso 8: Crear base de datos

```bash
# Acceder a PostgreSQL como administrador
sudo -u postgres psql

# Dentro de PostgreSQL, ejecuta:
CREATE USER amanwal_user WITH PASSWORD 'tu_contraseña_muy_segura';
CREATE DATABASE amanwal OWNER amanwal_user;
GRANT ALL PRIVILEGES ON DATABASE amanwal TO amanwal_user;
\q

# Salir de PostgreSQL
```

**Guarda esta información:**
```
Database URL: postgresql://amanwal_user:tu_contraseña_muy_segura@localhost:5432/amanwal
```

## Paso 9: Instalar herramientas adicionales

```bash
# PM2 (gestor de procesos)
sudo npm install -g pm2

# Certbot (SSL/HTTPS)
sudo apt install -y certbot python3-certbot-nginx

# Nginx (servidor web/proxy)
sudo apt install -y nginx

# Git (si no está)
sudo apt install -y git

# Verificar instalaciones
pm2 --version
nginx -v
certbot --version
```

---

# FASE 4: CLONAR Y PREPARAR TU APP (10 minutos)

## Paso 10: Clonar repositorio

```bash
# Crear carpeta
sudo mkdir -p /var/www/amanwal
sudo chown -R $USER:$USER /var/www/amanwal
cd /var/www/amanwal

# Clonar tu repo (reemplaza con tu URL de GitHub)
git clone https://github.com/Holasoyelrey101/amanwal.git .

# Verificar que se clonó
ls -la
```

## Paso 11: Instalar dependencias

```bash
cd /var/www/amanwal

# Instalar dependencias (esto toma 2-3 minutos)
npm run install-all

# Verificar que funcionó
ls -la backend/node_modules
ls -la frontend/node_modules
```

## Paso 12: Configurar variables de entorno

```bash
# Crear archivo .env en backend
nano backend/.env
```

**Pega este contenido (ajusta según tus valores):**

```env
# Backend Configuration
PORT=3001
NODE_ENV=production

# Database (usa la que creaste en Paso 8)
DATABASE_URL="postgresql://amanwal_user:tu_contraseña_muy_segura@localhost:5432/amanwal"

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aleatorio_123456789

# URLs de la aplicación
BACKEND_URL=https://amanwal.com
FRONTEND_URL=https://amanwal.com

# Flow Payment Gateway
FLOW_API_KEY=22FDEF88-C58C-48BB-B5E0-95EE88E31L1F
FLOW_SECRET_KEY=aff5268f770652441ff9e1bd1391d10f462bf122
FLOW_API_URL=https://sandbox.flow.cl/api

# Email (Gmail con App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password_de_gmail
```

**Guardar:** Presiona `Ctrl+X`, luego `Y`, luego `Enter`

## Paso 13: Compilar la aplicación

```bash
cd /var/www/amanwal

# Compilar backend
npm run build -w backend

# Compilar frontend
npm run build -w frontend

# Verificar que se compiló
ls -la backend/dist
ls -la frontend/dist
```

## Paso 14: Migrar base de datos

```bash
cd /var/www/amanwal/backend

# Ejecutar migraciones de Prisma
npm run prisma:migrate

# Responde "Y" cuando pregunte
```

---

# FASE 5: INICIAR BACKEND CON PM2 (5 minutos)

## Paso 15: Iniciar backend

```bash
cd /var/www/amanwal

# Iniciar con PM2
pm2 start backend/dist/server.js --name "amanwal-backend"

# Configurar para que inicie automáticamente
pm2 startup
pm2 save

# Ver que esté corriendo
pm2 status
pm2 logs amanwal-backend
```

**Deberías ver algo como:**
```
✔ PM2 has successfully started the application
→ App name: amanwal-backend
→ PID: 1234
→ Status: online
```

---

# FASE 6: CONFIGURAR NGINX (10 minutos)

## Paso 16: Crear configuración de Nginx

```bash
# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/amanwal
```

**Pega este contenido:**

```nginx
upstream backend {
    server 127.0.0.1:3001;
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name amanwal.com www.amanwal.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS (SSL)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name amanwal.com www.amanwal.com;

    # Certificados SSL (se crearán en el Paso 17)
    ssl_certificate /etc/letsencrypt/live/amanwal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amanwal.com/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Root para frontend
    root /var/www/amanwal/frontend/dist;

    # Límite de tamaño de archivos
    client_max_body_size 20M;

    # Frontend (React)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API (Backend proxy)
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Importante para webhooks
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Logs
    access_log /var/log/nginx/amanwal_access.log;
    error_log /var/log/nginx/amanwal_error.log;
}
```

**Guardar:** `Ctrl+X`, `Y`, `Enter`

## Paso 17: Habilitar sitio en Nginx

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/amanwal /etc/nginx/sites-enabled/

# Deshabilitar sitio por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar sintaxis
sudo nginx -t

# Si todo está bien, deberías ver: "successful"
```

---

# FASE 7: CONFIGURAR SSL/HTTPS (5 minutos)

## Paso 18: Apuntar dominio a tu IP

**Esto lo haces en tu registrador (GoDaddy, Namecheap, etc.):**

1. Entra a tu cuenta del registrador
2. Busca "DNS" o "Nameservers"
3. Agrega estos registros:
   - **Tipo:** A
   - **Nombre:** amanwal.com
   - **Valor:** `123.45.67.89` (tu IP del VPS)

4. Repite para `www.amanwal.com`

**Espera 5-10 minutos para que se propague**

Verifica con:
```bash
nslookup amanwal.com
```

## Paso 19: Generar certificado SSL

```bash
# Ejecutar certbot
sudo certbot --nginx -d amanwal.com -d www.amanwal.com

# Responde:
# 1. Email para avisos de renovación: tu_email@gmail.com
# 2. Acepta términos: Y
# 3. Compartir email: N (tu preferencia)
# 4. Elige redirigir HTTP a HTTPS: 2
```

**Certificado estará en:**
```
/etc/letsencrypt/live/amanwal.com/fullchain.pem
/etc/letsencrypt/live/amanwal.com/privkey.pem
```

## Paso 20: Reiniciar Nginx

```bash
# Recargar Nginx
sudo systemctl reload nginx

# Verificar estado
sudo systemctl status nginx

# Ver logs si hay problemas
sudo tail -f /var/log/nginx/error.log
```

---

# FASE 8: CONFIGURAR FIREWALL (5 minutos)

## Paso 21: Configurar UFW

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (MUY IMPORTANTE - sino pierdes acceso)
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS
sudo ufw allow 443/tcp

# Ver reglas
sudo ufw status

# Deberías ver:
# 22/tcp   ALLOW
# 80/tcp   ALLOW
# 443/tcp  ALLOW
```

---

# FASE 9: CONFIGURAR FLOW WEBHOOK (5 minutos)

## Paso 22: Configurar webhook en Flow

1. Entra a https://www.flow.cl/app/admin/
2. Busca **Configuración** o **Settings**
3. Busca sección de **Webhooks** o **URLs de Retorno**
4. Agregar URL:
   ```
   https://amanwal.com/api/payments/confirm
   ```
5. Guardar

---

# FASE 10: VERIFICAR QUE TODO FUNCIONA (5 minutos)

## Paso 23: Pruebas

```bash
# Ver logs del backend
pm2 logs amanwal-backend

# Ver estado del backend
pm2 status

# Ver estado de Nginx
sudo systemctl status nginx

# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Ver uso de memoria/disco
free -h
df -h
```

## Paso 24: Probar desde navegador

1. Abre: `https://amanwal.com`
2. Deberías ver tu app funcionando
3. Intenta:
   - Navegar por la app
   - Hacer una reserva (sin pagar)
   - Ver que no haya errores en consola

---

# FASE 11: MANTENIMIENTO Y MONITOREO

## Paso 25: Configurar backups automáticos

```bash
# Crear script de backup
sudo nano /home/walter/backup_db.sh
```

**Pega:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/amanwal"
mkdir -p $BACKUP_DIR

# Backup de base de datos
sudo -u postgres pg_dump amanwal > $BACKUP_DIR/amanwal_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/amanwal_$DATE.sql

# Limpiar backups más antiguos de 7 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

**Guardar y hacer ejecutable:**
```bash
chmod +x /home/walter/backup_db.sh

# Ejecutar diariamente (cron)
sudo crontab -e

# Agregar esta línea:
0 2 * * * /home/walter/backup_db.sh  # Backup a las 2:00 AM todos los días
```

## Paso 26: Monitoreo básico

```bash
# Ver logs en tiempo real
pm2 monit

# Ver logs del backend
pm2 logs amanwal-backend --lines 100

# Reiniciar backend si hay problema
pm2 restart amanwal-backend

# Ver espacio en disco
df -h

# Ver uso de memoria
free -h

# Ver procesos que más usan recursos
top  # Presiona 'q' para salir
```

---

# 📋 CHECKLIST FINAL

Verifica que todo esté hecho:

- [ ] VPS OVH creado
- [ ] Conectado por SSH
- [ ] Sistema actualizado
- [ ] Node.js 20 instalado
- [ ] PostgreSQL instalado y BD creada
- [ ] Nginx instalado
- [ ] PM2 instalado
- [ ] Certificbot instalado
- [ ] App clonada de GitHub
- [ ] Dependencias instaladas
- [ ] `.env` configurado
- [ ] App compilada (backend + frontend)
- [ ] Migraciones ejecutadas
- [ ] Backend corriendo en PM2
- [ ] Nginx configurado
- [ ] Dominio apuntando a IP
- [ ] SSL/HTTPS activado
- [ ] Firewall configurado
- [ ] Flow webhook configurado
- [ ] Pruebas exitosas en https://amanwal.com

---

# 🆘 TROUBLESHOOTING

## "No puedo conectar por SSH"
```bash
# Verifica que copiaste bien la IP
ssh -v root@123.45.67.89

# Verifica que el puerto 22 está abierto
```

## "Node.js no está instalado"
```bash
# Reinstalar
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## "PostgreSQL no arranca"
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

## "Nginx tiene error"
```bash
# Verificar sintaxis
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Reiniciar
sudo systemctl restart nginx
```

## "Backend no inicia"
```bash
pm2 logs amanwal-backend

# Verificar que el puerto 3001 no esté en uso
sudo lsof -i :3001

# Matar proceso que use puerto 3001
sudo kill -9 <PID>

# Reiniciar backend
pm2 restart amanwal-backend
```

## "HTTPS no funciona"
```bash
# Verificar certificado
sudo ls -la /etc/letsencrypt/live/amanwal.com/

# Forzar renovación
sudo certbot renew --force-renewal

# Verificar logs de certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

# 🎯 RESUMEN RÁPIDO (Para expertos)

```bash
# 1. SSH
ssh root@YOUR_IP

# 2. Setup
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
sudo apt install -y postgresql certbot python3-certbot-nginx nginx pm2 git
sudo npm install -g pm2

# 3. DB
sudo -u postgres psql -c "CREATE USER amanwal_user WITH PASSWORD 'pass'; CREATE DATABASE amanwal OWNER amanwal_user;"

# 4. App
cd /var/www && sudo mkdir amanwal && sudo chown $USER:$USER amanwal && cd amanwal
git clone https://github.com/Holasoyelrey101/amanwal.git .
npm run install-all
npm run build

# 5. Config
nano backend/.env
cd backend && npm run prisma:migrate && cd ..

# 6. PM2
pm2 start backend/dist/server.js --name "amanwal-backend" && pm2 save && pm2 startup

# 7. Nginx
sudo nano /etc/nginx/sites-available/amanwal
# [Pega config de Paso 16]
sudo ln -s /etc/nginx/sites-available/amanwal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. SSL
sudo certbot --nginx -d amanwal.com -d www.amanwal.com

# 9. Firewall
sudo ufw enable
sudo ufw allow 22,80,443/tcp

# 10. Test
https://amanwal.com
```

---

**¿Necesitas ayuda en algún paso específico? ¡Avísame en cuál!** 🚀
