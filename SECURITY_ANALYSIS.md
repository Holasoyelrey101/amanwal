# 🔐 ANÁLISIS DE SEGURIDAD - PANEL ADMIN

## Fecha: 9 de Diciembre 2025
## Versión: 1.0

---

## 1. VULNERABILIDADES ENCONTRADAS

### ⚠️ CRÍTICA: Sin Protección Contra Fuerza Bruta

**Severidad:** ALTA  
**Descripción:** El endpoint `/api/auth/login` no tenía protección contra intentos de fuerza bruta.  
**Impacto:** Un atacante podría hacer intentos ilimitados para adivinar credenciales.

**Código Vulnerable (ANTES):**
```typescript
// Sin rate limiting en auth.routes.ts
router.post('/login', authController.login); // ❌ Sin protección
```

**Estado:** ✅ **CORREGIDO**

---

## 2. ARQUITECTURA DE SEGURIDAD IMPLEMENTADA

### 2.1 Rate Limiting para Login
- **Máximo:** 5 intentos por IP cada 15 minutos
- **Identificador:** Combinación de IP + email
- **Respuesta:** Bloqueo de 15 minutos tras alcanzar límite
- **Mensaje:** "Demasiados intentos de login. Por favor, intenta más tarde."

```typescript
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase();
    return `${req.ip}-${email}`; // Específico por email + IP
  },
});
```

### 2.2 Rate Limiting para Registro
- **Máximo:** 3 registros por IP cada hora
- **Protege contra:** Spam de cuentas
- **Respuesta:** Bloqueo de 1 hora

```typescript
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros
});
```

### 2.3 Rate Limiting General de API
- **Máximo:** 100 requests por IP cada minuto
- **Aplica a:** Todas las rutas `/api/`
- **Excepciones:** `/api/health` (health checks)

```typescript
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests
});
```

### 2.4 Autenticación JWT
- **Token Duration:** 7 días (configurable en ENV)
- **Secret:** Protegido en variables de entorno
- **Verificación:** En cada request a rutas protegidas

```typescript
const generateToken = (userId: string, role: string = 'user'): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
};
```

### 2.5 Middleware de Autenticación
- **Valida:** Token JWT presente y válido
- **Valida:** Usuario existe en base de datos
- **Actualiza:** Rol desde BD en cada request (previene escalada de privs)

```typescript
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
  
  // Obtener rol ACTUAL de BD (no del token)
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true },
  });
  
  req.user = { id: decoded.id, role: user.role }; // Siempre de BD
  next();
};
```

### 2.6 Middleware de Admin
- **Requiere:** Autenticación JWT válida
- **Valida:** Role === 'admin'
- **Aplicado:** A todas las rutas `/api/admin/*`

```typescript
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  next();
};
```

---

## 3. ACCESO AL PANEL ADMIN

### ¿Se puede acceder con fuerza bruta?

**RESPUESTA:** ❌ **NO - Protegido**

**Razones:**

1. **Rate Limiting en Login:** Máximo 5 intentos en 15 minutos por email+IP
2. **JWT con expiración:** Token de 7 días, requiere regeneración
3. **Rol verificado en BD:** No se puede escalar privs con token antiguo
4. **Validación en middleware:** TODAS las rutas admin requieren token válido + rol admin

### Escenarios de Ataque Bloqueados:

| Ataque | Defensa |
|--------|---------|
| **Fuerza bruta directa (100 intentos)** | ❌ Bloqueado tras 5 intentos en 15 min |
| **Cambiar rol en JWT** | ❌ Rol siempre se verifica en BD |
| **Token expirado** | ❌ JWT válido solo 7 días |
| **Acceso sin token** | ❌ Middleware rechaza |
| **Spam de registros** | ❌ Max 3 por IP/hora |
| **Abuso de API general** | ❌ Max 100 req/min |

---

## 4. MEJORES PRÁCTICAS IMPLEMENTADAS

### ✅ Autenticación
- [x] JWT con expiración
- [x] Contraseñas hasheadas con bcrypt (salt 10)
- [x] Rol verificado en cada request desde BD
- [x] Verificación de email antes de login

### ✅ Rate Limiting
- [x] Protección contra fuerza bruta (5 intentos/15 min)
- [x] Protección contra spam de registros (3/hora)
- [x] Rate limit general de API (100/min)
- [x] Clave de rate limit específica por email en login

### ✅ Validación
- [x] Email válido requerido
- [x] Contraseña mínimo 6 caracteres
- [x] Role check en cada acceso a admin
- [x] Usuario existe antes de procesar

### ✅ Errores
- [x] Mensajes genéricos en login (no revela si email existe)
- [x] Respuestas 429 con retry-after para rate limits

---

## 5. CAMBIOS REALIZADOS

### Nuevo archivo:
```
backend/src/middleware/rateLimiter.middleware.ts
```

### Modificaciones:
```
backend/src/routes/auth.routes.ts (+ rate limiters)
backend/src/server.ts (+ rate limiter global)
backend/package.json (+ express-rate-limit)
```

### Compilación:
```bash
npm install express-rate-limit
npm run build
```

---

## 6. RECOMENDACIONES FUTURAS

### 🔹 Corto Plazo (1-2 semanas)
1. **2FA (Two-Factor Authentication)**
   - Código TOTP o SMS en login admin
   
2. **Audit Log**
   - Registrar todos los cambios de admin
   - IP, timestamp, acción realizada

3. **Lockout de Cuenta**
   - Después de 10 intentos fallidos, lockear cuenta 1 hora
   - Notificación por email

### 🔹 Mediano Plazo (1-2 meses)
1. **HTTPS Enforcement** ✅ Ya implementado
2. **CORS Restringido** - Limitar a dominios conocidos
3. **IP Whitelist para Admin** - Solo IPs autorizadas
4. **Helmet.js** - Headers de seguridad HTTP

### 🔹 Largo Plazo
1. **WAF (Web Application Firewall)** - Cloudflare, AWS WAF
2. **Penetration Testing** - Auditoría externa anual
3. **Rotación de JWT Secret** - Cada 6 meses
4. **OAuth2/OIDC** - Para terceros

---

## 7. CONFIGURACIÓN NECESARIA

Asegúrate que tu `.env` tenga:

```bash
JWT_SECRET=tu-secreto-muy-seguro-min-32-caracteres
JWT_EXPIRE=7d
NODE_ENV=production
```

---

## 8. PRUEBAS DE SEGURIDAD

### Test 1: Fuerza Bruta Bloqueada
```bash
# Hacer 6 requests POST a /api/auth/login con credenciales falsas
# Esperado: 5 retornan 401, 6º retorna 429 (Too Many Requests)
```

### Test 2: Rate Limit en API
```bash
# Hacer 101 requests rápidos a cualquier endpoint
# Esperado: Los primeros 100 OK, 101º retorna 429
```

### Test 3: Admin sin Token
```bash
curl https://amanwal.com/api/admin/cabins
# Esperado: 401 Unauthorized
```

### Test 4: Admin con Token No-Admin
```bash
# Login como usuario normal
# Usar token para acceder a /api/admin/*
# Esperado: 403 Forbidden
```

---

## 9. CONCLUSIÓN

El panel admin ahora está **protegido contra fuerza bruta** con:
- ✅ Rate limiting en login (5 intentos/15 min)
- ✅ Autenticación JWT con verificación en BD
- ✅ Middleware de admin en todas las rutas
- ✅ Protección general de API

**Riesgo de Fuerza Bruta:** 🟢 **BAJO**

---

## Versión del Documento
- v1.0 - 2025-12-09 - Análisis inicial + implementación de rate limiting
