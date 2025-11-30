# 💳 GUÍA DE FLOW - Sistema de Pagos

Integración completa de Flow (pasarela de pagos chilena).

---

## 📥 Paso 1: Crear Cuenta en Flow

1. Ve a [flow.cl](https://www.flow.cl)
2. Click en **"Regístrate"**
3. Completa con:
   - Nombre de empresa
   - Email
   - Teléfono
   - Contraseña
4. Verifica tu email
5. Inicia sesión

---

## 🔑 Paso 2: Obtener Credenciales

### Dashboard de Flow

1. Login en [flow.cl](https://www.flow.cl)
2. Ve a **Integraciones** → **Credenciales API**
3. Copiar:
   - **API Key** (Clave pública)
   - **Secret Key** (Clave privada) ⚠️ **CONFIDENCIAL**

### Guardar en Backend

En `backend/.env`:

```bash
FLOW_API_KEY=tu_api_key_aqui
FLOW_SECRET_KEY=tu_secret_aqui_muy_confidencial
FLOW_ENVIRONMENT=sandbox
```

---

## 🧪 Paso 3: Modo Sandbox (Desarrollo)

Flow ofrece ambiente de prueba seguro:

```bash
FLOW_ENVIRONMENT=sandbox
```

### Tarjetas de Prueba

```
Visa
- Número: 4111 1111 1111 1111
- Fecha: 12/25
- CVV: 123

Mastercard
- Número: 5555 5555 5555 4444
- Fecha: 12/25
- CVV: 123
```

### Usuarios de Prueba

```
Email: prueba@test.com
Teléfono: +56987654321
Cédula: 12345678-9
```

---

## 🚀 Paso 4: Configurar URLs de Retorno

**Importante**: Flow necesita saber a dónde redirigir después del pago.

### En Flow Dashboard

1. Ve a **Integraciones** → **URLs de Retorno**
2. Configura:

**Para Desarrollo Local:**
```
URL de Retorno: http://localhost:3000/api/payments/return
URL de Webhook: http://localhost:3000/api/payments/confirm
```

**Para Producción con Ngrok:**
```
URL de Retorno: https://tu-url-ngrok/api/payments/return
URL de Webhook: https://tu-url-ngrok/api/payments/confirm
```

---

## 🔄 Paso 5: Flujo de Pago

```
1. Usuario en app
   ↓
2. Hace una reserva
   ↓
3. Click en "Pagar"
   ↓
4. Backend crea orden en Flow → obtiene token
   ↓
5. Frontend redirige a Flow con token
   ↓
6. Usuario ingresa tarjeta de crédito
   ↓
7. Flow procesa pago
   ↓
8. Flow redirige a: http://localhost:3000/api/payments/return
   ↓
9. Backend valida pago con Flow
   ↓
10. Backend redirige a: http://localhost:5173/payment-return/:bookingId
   ↓
11. Frontend muestra "¡Pago Realizado!"
   ↓
12. Reserva cambia a estado "Confirmada"
   ↓
13. Email de confirmación enviado
```

---

## 🎮 Paso 6: Probar un Pago

### Preparar Sistema

1. **Terminal 1**: Backend corriendo
   ```bash
   cd backend && npm run dev
   ```

2. **Terminal 2**: Frontend corriendo
   ```bash
   cd frontend && npm run dev
   ```

3. **Navegador**: Abre `http://localhost:5173`

### Hacer Pago de Prueba

1. Click en **"Registrarse"**
   - Email: `prueba@test.com`
   - Nombre: `Test User`
   - Contraseña: `test123`

2. Ves lista de cabañas

3. Click en una cabaña → **"Reservar"**
   - Selecciona fechas
   - Click en **"Reservar"**

4. En "Mis Reservas" → Click en **"Pagar"**

5. Se abre Flow
   - Ingresa tarjeta: `4111 1111 1111 1111`
   - Fecha: `12/25`
   - CVV: `123`
   - Click en **"Pagar"**

6. ✅ Automáticamente:
   - Se muestra **"¡Pago Realizado!"**
   - Te redirige a "Mis Reservas"
   - Reserva muestra estado **"Confirmada"**
   - Recibes email de confirmación

---

## 🔍 Solución de Problemas

### ❌ "Invalid API Key"

1. Verifica que `FLOW_API_KEY` esté en `backend/.env`
2. Copia exactamente desde Flow dashboard (sin espacios)
3. Reinicia backend: `npm run dev`

### ❌ "Unauthorized" en Flow

1. Verifica que `FLOW_SECRET_KEY` sea correcto
2. Comprueba que `FLOW_ENVIRONMENT=sandbox`
3. Revisa logs del backend para más detalles

### ❌ Flow abre pero pago "falla"

1. Verifica que uses tarjeta de prueba
2. Comprueba que fecha sea futura (12/25)
3. CVV debe ser 123

### ❌ Pago procesa pero reserva sigue "Pending"

1. Verifica que webhook esté configurado en Flow
2. Revisa logs del backend: `console.log()`
3. Comprueba que `/bookings/:id/confirm` se llamó

### ❌ No recibo email después de pagar

1. Verifica configuración de email en `backend/.env`
2. Lee: `../FLOW-PAGOS.md` (configuración SMTP)
3. Revisa carpeta de spam

---

## 📊 Transiciones de Estado

```
Reserva creada:        status = "pending"
Usuario paga:          status = "pending" → "confirmed"
                       paymentStatus = "completed"
                       paymentDate = now()

Usuario cancela:       status = "confirmed" → "cancelled"

Admin cancela:         status = cualquiera → "cancelled"
```

---

## 🏪 Pasar a Producción

### 1. Cambiar a Ambiente Real

En `backend/.env`:
```bash
FLOW_ENVIRONMENT=production
```

### 2. Obtener Credenciales Reales

1. En Flow Dashboard
2. Ve a **Integraciones** → **Credenciales API**
3. Copia credenciales de **Producción**
4. Reemplaza en `.env`

### 3. Actualizar URLs

En Flow Dashboard → **URLs de Retorno**:
```
URL de Retorno: https://tu-dominio.com/api/payments/return
URL de Webhook: https://tu-dominio.com/api/payments/confirm
```

### 4. Tarjetas Reales

Ya puedes usar tarjetas de crédito reales.

---

## 💡 Tips Útiles

### Ver Transacciones

En Flow Dashboard → **Transacciones**
- Ver todos los pagos
- Estado de cada pago
- Montos
- Fechas

### Generar Reportes

Flow permite exportar reportes de:
- Pagos por período
- Ingresos
- Comisiones

### Webhook Debugging

Si webhook no funciona:
1. Verifica URL en Flow Dashboard
2. Prueba URL manualmente: `https://tu-url/api/payments/confirm`
3. Revisa logs del backend

---

## 📚 Documentación Oficial

- [Flow.cl API Docs](https://www.flow.cl/developers)
- [Sandbox Guide](https://www.flow.cl/developers/sandbox)
- [API Reference](https://www.flow.cl/developers/api)

---

**Happy Payments! 💳**

---

**Última actualización**: Noviembre 2025
