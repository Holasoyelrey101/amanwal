import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

/**
 * Script para convertir imágenes base64 antiguas a WebP
 * Uso: npx ts-node scripts/convertOldImagesToWebP.ts
 */

async function convertBase64ToWebP(base64String: string, fileName: string): Promise<string> {
  try {
    // Extraer el buffer del base64
    const base64Data = base64String.split(',')[1] || base64String;
    const buffer = Buffer.from(base64Data, 'base64');

    // Crear path de salida
    const uploadsDir = path.join(__dirname, '../uploads/cabins');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const outputPath = path.join(uploadsDir, fileName);

    // Convertir a WebP
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`✅ Convertido: ${fileName}`);
    return `/uploads/cabins/${fileName}`;
  } catch (error) {
    console.error(`❌ Error convirtiendo ${fileName}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔄 Iniciando conversión de imágenes antiguas...\n');

    // Obtener todas las cabañas
    const cabins = await prisma.cabin.findMany({
      where: {
        images: {
          contains: 'data:image',
        },
      },
    });

    console.log(`📊 Encontradas ${cabins.length} cabañas con imágenes base64\n`);

    let convertedCount = 0;
    let errorCount = 0;

    for (const cabin of cabins) {
      try {
        let images = [];
        try {
          images = JSON.parse(cabin.images || '[]');
        } catch {
          console.log(`⚠️  Cabaña ${cabin.id}: no se pudo parsear images`);
          continue;
        }

        // Filtrar solo imágenes base64
        const base64Images = images.filter((img: string) => typeof img === 'string' && img.startsWith('data:image'));

        if (base64Images.length === 0) {
          console.log(`⏭️  Cabaña ${cabin.id}: sin imágenes base64`);
          continue;
        }

        console.log(`\n🏠 Procesando cabaña: ${cabin.title}`);
        console.log(`   ID: ${cabin.id}`);
        console.log(`   Imágenes base64: ${base64Images.length}`);

        const newImages: string[] = [];

        // Convertir cada imagen
        for (let i = 0; i < base64Images.length; i++) {
          const base64Image = base64Images[i];
          const fileName = `cabin-${cabin.id}-${i}-${Date.now()}.webp`;

          const webpUrl = await convertBase64ToWebP(base64Image, fileName);
          newImages.push(webpUrl);
        }

        // Agregar imágenes que ya eran URLs
        const urlImages = images.filter((img: string) => typeof img === 'string' && !img.startsWith('data:image'));
        newImages.push(...urlImages);

        // Actualizar en BD
        await prisma.cabin.update({
          where: { id: cabin.id },
          data: {
            images: JSON.stringify(newImages),
          },
        });

        console.log(`   ✅ Actualizada con ${newImages.length} imágenes WebP\n`);
        convertedCount++;
      } catch (error) {
        console.error(`   ❌ Error procesando cabaña ${cabin.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n📋 Resumen:');
    console.log(`   ✅ Cabañas convertidas: ${convertedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📂 Imágenes guardadas en: backend/uploads/cabins/`);
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
