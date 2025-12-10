import fs from 'fs';
import path from 'path';

/**
 * Script para gestionar la página de mantenimiento
 * Asegura que la página de mantenimiento se sirva correctamente sin afectar el index.html
 */

const distPath = path.resolve(process.cwd(), '../frontend/dist');
const publicPath = path.resolve(process.cwd(), '../frontend/public');
const maintenanceSourceFile = path.join(publicPath, '503.html');
const maintenanceDistFile = path.join(distPath, 'maintenance.html');

async function setupMaintenance() {
  try {
    // Verificar que el archivo 503.html existe
    if (!fs.existsSync(maintenanceSourceFile)) {
      console.error(`❌ Error: No se encontró ${maintenanceSourceFile}`);
      process.exit(1);
    }

    // Copiar 503.html a maintenance.html en dist
    fs.copyFileSync(maintenanceSourceFile, maintenanceDistFile);
    console.log(`✅ Página de mantenimiento configurada en: ${maintenanceDistFile}`);

    // Verificar que index.html existe y no es la página de mantenimiento
    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf-8');
      if (content.includes('Enseguida volvemos') || content.includes('Sistema en mantenimiento')) {
        console.warn('⚠️ Advertencia: index.html parece ser la página de mantenimiento');
        console.warn('   Se recomienda restaurar el index.html original');
      } else {
        console.log(`✅ index.html está configurado correctamente`);
      }
    }
  } catch (error) {
    console.error('❌ Error al configurar mantenimiento:', error);
    process.exit(1);
  }
}

setupMaintenance();
