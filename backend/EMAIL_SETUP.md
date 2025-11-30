# Configuración de Envío de Correos Electrónicos

El sistema ahora envía correos electrónicos automáticos cuando:
- Se confirma una reserva
- Se cancela una reserva

## Configuración necesaria

### Opción 1: Gmail (Recomendado para desarrollo)

1. **Habilitar autenticación de 2 factores en tu cuenta de Google**
   - Ve a https://myaccount.google.com/
   - Selecciona "Seguridad"
   - Habilita "Verificación en 2 pasos"

2. **Generar contraseña de aplicación**
   - Ve a https://myaccount.google.com/apppasswords
   - Selecciona "Mail" y "Windows"
   - Google te generará una contraseña de 16 caracteres

3. **Actualizar `.env` del backend**
   ```
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Opción 2: Otros servicios (Sendgrid, Mailgun, etc.)

Si deseas usar otro servicio, modifica `backend/src/utils/emailService.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

## Plantillas de correo

El sistema incluye dos plantillas HTML profesionales:

1. **Confirmación de reserva** - Verde (#10b981)
   - Información de la cabaña
   - Fechas de check-in y check-out
   - Precio total
   - Número de reserva

2. **Cancelación de reserva** - Rojo (#ef4444)
   - Información similar
   - Monto de reembolso

## Prueba rápida

1. Reinicia el backend: `npm run dev`
2. Crea una nueva reserva desde el frontend
3. Verifica que recibas el correo en tu bandeja
4. Cancela una reserva y verifica el correo de cancelación

## Solución de problemas

### Error: "Invalid login: 535-5.7.8 Username and password not accepted"
- Verifica que habilitaste autenticación de 2 factores
- Verifica que generaste una contraseña de aplicación (no uses tu contraseña normal)
- Asegúrate de copiar los 16 caracteres correctamente sin espacios

### No recibo correos
- Revisa la consola del backend para ver si hay errores
- Verifica que el email sea correcto en la base de datos
- Prueba enviando un correo de prueba manualmente

### Los correos van al spam
- Agrega el dominio a tu lista blanca
- Verifica el contenido HTML de las plantillas
