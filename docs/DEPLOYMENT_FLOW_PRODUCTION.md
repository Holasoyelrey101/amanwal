# 🚀 Deployment con Flow en Producción

## ✅ Pre-requisitos

- [ ] Servidor Ubuntu con Node.js 20
- [ ] Dominio `amanwal.com` apuntando al servidor
- [ ] PostgreSQL/MongoDB corriendo
- [ ] SSL/HTTPS activado con Let's Encrypt
- [ ] Credenciales de Flow (API Key + Secret)

---

## 🔧 Pasos en el Servidor Ubuntu

### 1. Clonar proyecto y instalar dependencias

```bash
cd /var/www/amanwal
git clone https://github.com/Holasoyelrey101/amanwal.git .
npm run install-all
```

### 2. Configurar .env (Backend)

```bash
nano backend/.env
```

**Contenido:**
```
# Backend
PORT=3001
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/amanwal"
JWT_SECRET=tu_jwt_secret_muy_seguro

# URLs de Producción (SIN ngrok)
BACKEND_URL=https://amanwal.com
FRONTEND_URL=https://amanwal.com

# Flow Payment Gateway (Sandbox o Producción)
FLOW_API_KEY=22FDEF88-C58C-48BB-B5E0-95EE88E31L1F
FLOW_SECRET_KEY=aff5268f770652441ff9e1bd1391d10f462bf122
FLOW_API_URL=https://sandbox.flow.cl/api

# Email (Gmail/SendGrid/otro servicio)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

### 3. Compilar aplicación

```bash
npm run build -w backend
npm run build -w frontend
```

### 4. Configurar base de datos

```bash
cd backend
npm run prisma:migrate
cd ..
```

### 5. Iniciar con PM2

```bash
pm2 start dist/server.js --name "amanwal-backend" --cwd /var/www/amanwal/backend
pm2 save
pm2 startup
```

### 6. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/amanwal
```

**Contenido (incluye Flow webhook):**
```nginx
upstream backend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name amanwal.com www.amanwal.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name amanwal.com www.amanwal.com;

    ssl_certificate /etc/letsencrypt/live/amanwal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/amanwal.com/privkey.pem;

    # Frontend (React build)
    root /var/www/amanwal/frontend/dist;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy (incluyendo webhooks de Flow)
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
        
        # Importante para webhooks de Flow
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/amanwal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d amanwal.com -d www.amanwal.com
```

### 8. Configurar Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🔗 Configuración de Flow

### Panel de Flow (https://www.flow.cl/app/admin/)

1. **Ir a Configuración / Settings**
2. **Buscar Webhooks o URL de Confirmación**
3. **Agregar:** `https://amanwal.com/api/payments/confirm`
4. **Guardar**

---

## 🧪 Pruebas

### Test desde terminal

```bash
# Ver logs en vivo
pm2 logs amanwal-backend

# Test webhook manualmente
curl -X POST https://amanwal.com/api/payments/confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"TEST_TOKEN_12345"}'

# Ver estado del backend
pm2 status
```

### Test desde navegador

1. Ir a: `https://amanwal.com`
2. Intentar hacer una reserva
3. Hacer clic en pagar
4. Completar pago en Flow
5. Verificar que se confirme en tu BD

---

## 🚨 Troubleshooting

### "Flow webhook no recibe confirmación"
- [ ] Verificar que `BACKEND_URL` y `FRONTEND_URL` son correctas
- [ ] Revisar logs: `pm2 logs amanwal-backend`
- [ ] Confirmar que Flow tiene la URL correcta en su panel
- [ ] Verificar HTTPS funciona: `curl https://amanwal.com/api/payments/confirm`

### "Error de conexión a base de datos"
- [ ] Verificar `DATABASE_URL` en .env
- [ ] Confirmar PostgreSQL/MongoDB está corriendo
- [ ] Ejecutar: `npm run prisma:migrate`

### "Email no se envía"
- [ ] Verificar credenciales SMTP en .env
- [ ] Para Gmail: habilitar "Contraseñas de aplicación"
- [ ] Revisar logs: `pm2 logs amanwal-backend`

---

## 📊 Monitoreo

```bash
# Monitorear en tiempo real
pm2 monit

# Ver logs del backend
pm2 logs amanwal-backend --lines 100

# Reiniciar si hay problemas
pm2 restart amanwal-backend

# Ver estado de Nginx
sudo systemctl status nginx

# Ver uso de disco
df -h

# Ver uso de memoria
free -h
```

---

## 🔄 Actualizar código

```bash
cd /var/www/amanwal

# Actualizar desde GitHub
git pull origin main

# Reinstalar dependencias (si es necesario)
npm run install-all

# Compilar
npm run build

# Reiniciar
pm2 restart amanwal-backend
```

---

## 🔐 Seguridad Recomendada

- [ ] Cambiar `JWT_SECRET` por uno aleatorio seguro
- [ ] Usar variables de entorno para credenciales
- [ ] Habilitar HTTPS/SSL (Let's Encrypt)
- [ ] Configurar Firewall (UFW)
- [ ] Backups automáticos de BD
- [ ] Cambiar contraseña de Flow a producción (no sandbox)

---

## 🎯 Resumen Rápido

```bash
# 1. En servidor Ubuntu
cd /var/www/amanwal
git clone ...
npm run install-all
npm run build

# 2. Configurar .env
nano backend/.env  # Agregar variables

# 3. Base de datos
cd backend && npm run prisma:migrate && cd ..

# 4. Iniciar
pm2 start dist/server.js --name "amanwal-backend"

# 5. Configurar Nginx + SSL
# (Ver pasos arriba)

# 6. Agregar webhook en panel Flow
# https://amanwal.com/api/payments/confirm
```

**¡Listo! Tu app estará en https://amanwal.com con pagos Flow funcionando** 🚀
