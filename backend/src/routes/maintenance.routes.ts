import { Router, Request, Response } from 'express';
import {
  getMaintenanceStatus,
  enableMaintenance,
  disableMaintenance,
} from '../middleware/maintenance.middleware';

const router = Router();

/**
 * Middleware para verificar token admin
 * Las rutas de mantenimiento NO usan auth JWT, usan un token especial en headers
 */
const verifyAdminToken = (req: Request, res: Response, next: Function) => {
  const adminToken = process.env.ADMIN_MAINTENANCE_TOKEN;
  const token = req.headers['x-admin-token'] as string;

  console.log('🔐 Verificando token de mantenimiento');
  console.log('   Token enviado:', token ? '✓ Presente' : '✗ Falta');
  console.log('   Token configurado:', adminToken ? '✓ Presente' : '✗ Falta');

  if (!adminToken) {
    console.error('❌ ADMIN_MAINTENANCE_TOKEN no configurado en .env');
    return res.status(500).json({
      success: false,
      error: 'Token admin no configurado en el servidor',
    });
  }

  if (!token) {
    console.error('❌ Token no proporcionado en headers');
    return res.status(401).json({
      success: false,
      error: 'Token de admin no proporcionado',
    });
  }

  if (token !== adminToken) {
    console.error(`❌ Token incorrecto. Recibido: "${token.substring(0, 10)}..."`);
    return res.status(401).json({
      success: false,
      error: 'Token de admin inválido',
    });
  }

  console.log('✅ Token válido');
  next();
};

/**
 * GET /api/maintenance - Obtener estado del mantenimiento
 */
router.get('/', verifyAdminToken, (req: Request, res: Response) => {
  console.log('📋 Obteniendo estado de mantenimiento');
  const status = getMaintenanceStatus();
  res.json({
    success: true,
    maintenance: status,
  });
});

/**
 * POST /api/maintenance/enable - Activar modo mantenimiento
 */
router.post('/enable', verifyAdminToken, (req: Request, res: Response) => {
  const { message } = req.body;
  console.log('🔧 Activando modo mantenimiento');
  enableMaintenance(message || 'Sistema en mantenimiento');

  res.json({
    success: true,
    message: 'Modo mantenimiento activado',
    maintenance: getMaintenanceStatus(),
  });
});

/**
 * POST /api/maintenance/disable - Desactivar modo mantenimiento
 */
router.post('/disable', verifyAdminToken, (req: Request, res: Response) => {
  console.log('✅ Desactivando modo mantenimiento');
  disableMaintenance();

  res.json({
    success: true,
    message: 'Modo mantenimiento desactivado',
    maintenance: getMaintenanceStatus(),
  });
});

export default router;
