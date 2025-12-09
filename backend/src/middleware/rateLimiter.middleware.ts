import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limiter para login - máximo 5 intentos por IP cada 15 minutos
 * Protege contra fuerza bruta
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de login. Por favor, intenta más tarde.',
  standardHeaders: true, // retorna info de rate limit en `RateLimit-*` headers
  legacyHeaders: false, // deshabilita `X-RateLimit-*` headers
  skip: (req) => {
    // Permitir requests desde localhost en desarrollo
    return process.env.NODE_ENV === 'development' && (req.ip === '::1' || req.ip === '127.0.0.1');
  },
  keyGenerator: (req) => {
    // Usar ipKeyGenerator helper para soportar IPv6 correctamente
    const email = (req.body?.email || '').toLowerCase();
    const ipKey = ipKeyGenerator(req);
    return `${ipKey}-${email}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de login. Por favor, intenta en 15 minutos.',
      retryAfter: 900, // 15 minutos en segundos
    });
  },
});

/**
 * Rate limiter general para API - máximo 100 requests por IP cada minuto
 * Protege contra abuso general
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests
  message: 'Demasiadas requests. Por favor, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Permitir health checks
    return req.path === '/api/health';
  },
});

/**
 * Rate limiter estricto para operaciones críticas
 * máximo 10 requests por IP cada hora
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: 'Demasiadas operaciones. Por favor, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Límite de operaciones alcanzado. Por favor, intenta en una hora.',
      retryAfter: 3600,
    });
  },
});

/**
 * Rate limiter para registro - máximo 3 por IP cada hora
 * Previene spam de registros
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros
  message: 'Demasiados registros. Por favor, intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Límite de registros alcanzado. Por favor, intenta en una hora.',
      retryAfter: 3600,
    });
  },
});
