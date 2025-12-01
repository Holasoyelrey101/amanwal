import { sendEmail, getConfirmationEmailTemplate } from '../src/utils/emailService';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  try {
    console.log('🧪 Probando servicio de correo...');
    console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER || 'NO CONFIGURADO'}`);
    console.log(`🔑 EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);

    const emailTemplate = getConfirmationEmailTemplate(
      'Usuario Prueba',
      'Cabaña Test',
      new Date().toISOString(),
      new Date(Date.now() + 86400000).toISOString(),
      150000,
      'RES-TEST-001'
    );

    await sendEmail({
      to: 'sir.uk101@gmail.com',
      subject: '🧪 Prueba de Correo - Amanwal',
      html: emailTemplate
    });

    console.log('✅ Correo de prueba enviado exitosamente');
  } catch (error) {
    console.error('❌ Error al enviar correo de prueba:', error);
    process.exit(1);
  }
};

testEmail();
