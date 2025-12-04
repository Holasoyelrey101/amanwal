import { Router, Request, Response } from 'express';
import { uploadImages, convertToWebP, getImageUrl } from '../config/imageUpload';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * POST /admin/upload-images
 * Subir múltiples imágenes y obtener sus URLs
 * Acepta FormData con array de archivos
 */
router.post('/upload-images', uploadImages.array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    const imageUrls: string[] = [];
    const errors: string[] = [];

    // Procesar cada archivo
    for (const file of uploadedFiles) {
      try {
        // Convertir a WebP
        const webpPath = await convertToWebP(file.path);
        const fileName = path.basename(webpPath);
        const imageUrl = getImageUrl(fileName);
        imageUrls.push(imageUrl);
      } catch (error) {
        errors.push(`Error procesando ${file.originalname}: ${error}`);
        // Intentar limpiar archivo fallido
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (imageUrls.length === 0) {
      return res.status(500).json({ error: 'No se pudieron procesar los archivos', details: errors });
    }

    res.json({
      success: true,
      imageUrls,
      message: `${imageUrls.length} imagen(es) subida(s) correctamente`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error en upload:', error);
    res.status(500).json({ error: error.message || 'Error al subir imágenes' });
  }
});

export default router;
