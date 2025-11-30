# 📧 GUÍA DE EMAIL - Configuración SMTP

Cómo configurar las notificaciones por email automáticas.

---

## 🔐 Configuración con Gmail

### Paso 1: Habilitar 2FA

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Click en **Security** (lado izquierdo)
3. Busca **2-Step Verification**
4. Sigue los pasos para habilitar

### Paso 2: Generar Contraseña de Aplicación

1. En Security, busca **App passwords**
   - Si no ves esta opción, primero habilita 2FA
2. Selecciona:
   - App: **Mail**
   - Device: **Windows** (o tu SO)
3. Google genera contraseña de 16 caracteres
4. **Copia exactamente** (con espacios)

### Paso 3: Configurar en backend/.env

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FROM_EMAIL=noreply@amanwal.com
```

Ejemplo real:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=walterchavez63@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
FROM_EMAIL=reservas@amanwal.com
```

### Paso 4: Reiniciar Backend

```bash
cd backend
npm run dev
```

---

## 📨 Tipos de Email que se Envían

### 1. Confirmación de Registro
Cuando un usuario se registra

**Destinatario**: Nuevo usuario
**Asunto**: Bienvenido a Amanwal
**Contenido**: Confirmación de registro

### 2. Confirmación de Reserva
Cuando se crea una nueva reserva (antes de pagar)

**Destinatario**: Usuario
**Asunto**: Reserva creada - [Número de reserva]
**Contenido**: 
- Número de reserva
- Cabaña
- Fechas
- Precio total
- Link para pagar

### 3. Confirmación de Pago
Cuando el pago se procesa exitosamente

**Destinatario**: Usuario
**Asunto**: ✓ Pago Confirmado - [Número de reserva]
**Contenido**:
- Detalles del pago
- Número de reserva
- Detalles de la cabaña
- Confirmación de estadía

### 4. Cancelación de Reserva
Cuando se cancela una reserva

**Destinatario**: Usuario
**Asunto**: Reserva Cancelada - [Número de reserva]
**Contenido**:
- Motivo de cancelación
- Detalles de reembolso

---

## 🧪 Probar Envío de Email

### Prueba 1: Registrarse

1. Abre app en `http://localhost:5173`
2. Click en **"Registrarse"**
3. Completa con tu email real
4. Click en **"Registrarse"**
5. ✅ Deberías recibir email de bienvenida

### Prueba 2: Crear Reserva

1. Login en app
2. Click en una cabaña
3. Selecciona fechas
4. Click en **"Reservar"**
5. ✅ Deberías recibir email de confirmación

### Prueba 3: Pagar Reserva

1. En "Mis Reservas", click en **"Pagar"**
2. Completa pago con Flow (tarjeta de prueba)
3. ✅ Deberías recibir email de confirmación de pago

---

## 🔍 Solución de Problemas

### ❌ "Email failed to send"

1. Verifica que `SMTP_USER` sea correcto
2. Verifica que `SMTP_PASS` sea exacto (con espacios)
3. Verifica que 2FA esté habilitado en Gmail
4. Verifica que generes nueva contraseña de app

### ❌ "Comprueba tu configuración de SMTP"

1. Verifica `SMTP_HOST`: debe ser `smtp.gmail.com`
2. Verifica `SMTP_PORT`: debe ser `587`
3. Verifica que no haya espacios extra

### ❌ Email llega pero con contenido corrupto

1. Verifica encoding en `emailService.ts`
2. Comprueba templates HTML

### ❌ No recibo email después de pagar

1. Verifica que pago se procesó (mira estado de reserva)
2. Revisa carpeta de spam
3. Revisa logs del backend

---

## 💡 Tips Útiles

### Ver Emails en Desarrollo

Si no quieres enviar emails reales en desarrollo:

```bash
# Backend - usar consola para debug
# En emailService.ts:
console.log('Email que se enviaría:', {
  to: recipient,
  subject: subject,
  html: html
});
```

### Cambiar Remitente

En `backend/.env`:
```bash
FROM_EMAIL=tu_email@dominio.com
```

Ejemplo:
```bash
FROM_EMAIL=reservas@amanwal.com
```

### Usar Otro Proveedor SMTP

Si no quieres usar Gmail:

**SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
```

**AWS SES:**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=tu_usuario_ses
SMTP_PASS=tu_contraseña_ses
```

---

## 📋 Checklist de Setup

```
✅ 2FA habilitado en Gmail
✅ Contraseña de app generada
✅ backend/.env configurado
✅ Backend reiniciado
✅ Probé registro y recibí email
✅ Probé reserva y recibí email
✅ Probé pago y recibí email
```

---

**Happy Mailing! 📧**

---

**Última actualización**: Noviembre 2025
