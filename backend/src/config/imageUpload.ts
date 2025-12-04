import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/cabins');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: cabin-timestamp-random.webp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cabin-${uniqueSuffix}.webp`);
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)'));
  }
};

// Middleware de multer
export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
});

// Función para convertir imagen a WebP
export const convertToWebP = async (filePath: string): Promise<string> => {
  try {
    const outputPath = filePath.replace(/\.[^.]+$/, '.webp');
    
    await sharp(filePath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    // Eliminar archivo original si es diferente
    if (filePath !== outputPath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return outputPath;
  } catch (error) {
    console.error('Error al convertir imagen a WebP:', error);
    throw error;
  }
};

// Función para obtener URL pública de la imagen
export const getImageUrl = (fileName: string): string => {
  return `/uploads/cabins/${fileName}`;
};
