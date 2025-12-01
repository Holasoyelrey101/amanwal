import nodemailer from 'nodemailer';

// Configurar transportador de correo
// Usar variables de entorno para configuración en producción
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-contraseña-app'
  }
});

// Verificar la conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Servidor de email está listo');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log(`📧 Intentando enviar email a: ${options.to}`);
    console.log(`📧 Usuario del email: ${process.env.EMAIL_USER}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'Amanwal <noreply@amanwal.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

// Plantilla de correo para cancelación de reserva
export const getCancellationEmailTemplate = (
  userName: string,
  cabinTitle: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number,
  bookingNumber: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .info-block { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; margin-left: 10px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ Reserva Cancelada</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Tu reserva ha sido cancelada exitosamente.</p>
          
          <div class="info-block">
            <p><span class="label">Número de Reserva:</span> <span class="value">${bookingNumber}</span></p>
            <p><span class="label">Cabaña:</span> <span class="value">${cabinTitle}</span></p>
            <p><span class="label">Check-in:</span> <span class="value">${new Date(checkIn).toLocaleDateString('es-ES')}</span></p>
            <p><span class="label">Check-out:</span> <span class="value">${new Date(checkOut).toLocaleDateString('es-ES')}</span></p>
            <p><span class="label">Monto Reembolsado:</span> <span class="value">$${totalPrice.toLocaleString('es-ES')}</span></p>
          </div>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          
          <p>Saludos,<br><strong>Equipo Amanwal</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantilla de correo para confirmación de reserva
export const getConfirmationEmailTemplate = (
  userName: string,
  cabinTitle: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number,
  bookingNumber: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px; }
        .info-block { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; margin-left: 10px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✓ Reserva Confirmada</h2>
        </div>
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <p>¡Tu reserva ha sido confirmada exitosamente!</p>
          
          <div class="info-block">
            <p><span class="label">Número de Reserva:</span> <span class="value">${bookingNumber}</span></p>
            <p><span class="label">Cabaña:</span> <span class="value">${cabinTitle}</span></p>
            <p><span class="label">Check-in:</span> <span class="value">${new Date(checkIn).toLocaleDateString('es-ES')}</span></p>
            <p><span class="label">Check-out:</span> <span class="value">${new Date(checkOut).toLocaleDateString('es-ES')}</span></p>
            <p><span class="label">Monto Total:</span> <span class="value">$${totalPrice.toLocaleString('es-ES')}</span></p>
          </div>
          
          <p>¡Esperamos que disfrutes tu estadía!</p>
          
          <p>Saludos,<br><strong>Equipo Amanwal</strong></p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
