import { Router, Request, Response } from 'express';
import { uploadImages, convertToWebP, getImageUrl } from '../config/imageUpload';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * POST /admin/upload-images
 * Subir múltiples imágenes y obtener sus URLs
 * Acepta FormData con array de archivos (máximo 10)
 */
router.post('/upload-images', uploadImages.array('images', 50), async (req: Request, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadedFiles = req.files as Express.Multer.File[];

    // Validar límite de 10 archivos
    if (uploadedFiles.length > 10) {
      // Limpiar archivos rechazados
      uploadedFiles.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          // Ignorar errores al limpiar
        }
      });
      return res.status(400).json({ 
        error: 'Máximo 10 imágenes por upload. Por favor, intenta nuevamente con menos archivos.' 
      });
    }

    const imageUrls: string[] = [];
    const errors: string[] = [];

    // Procesar archivos en paralelo para mejor rendimiento
    const processingPromises = uploadedFiles.map(async (file) => {
      try {
        // Convertir a WebP
        const webpPath = await convertToWebP(file.path);
        const fileName = path.basename(webpPath);
        const imageUrl = getImageUrl(fileName);
        return { success: true, imageUrl };
      } catch (error) {
        errors.push(`Error procesando ${file.originalname}: ${error}`);
        // Intentar limpiar archivo fallido
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return { success: false };
      }
    });

    // Esperar a que todas las promesas se completen (incluso si algunas fallan)
    const results = await Promise.allSettled(processingPromises);
    
    // Extraer URLs exitosas
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        imageUrls.push(result.value.imageUrl);
      }
    });

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
