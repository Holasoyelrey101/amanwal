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
  fromName?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log(`📧 Intentando enviar email a: ${options.to}`);
    console.log(`📧 Usuario del email: ${process.env.EMAIL_USER}`);
    
    const fromName = options.fromName || "🏡 Amanwal Support";
    const mailOptions = {
      from: `"${fromName}" <${process.env.EMAIL_USER}>`,
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
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header { 
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(185, 28, 28, 0.9) 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
          border-bottom: 1px solid rgba(239, 68, 68, 0.3);
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 8px;
          font-weight: 600;
        }
        .header p { 
          font-size: 14px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px;
          color: #e2e8f0;
        }
        .greeting { 
          font-size: 16px;
          margin-bottom: 20px;
          color: #cbd5e1;
        }
        .greeting strong { color: #f1f5f9; }
        .info-grid { 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 30px 0;
        }
        .info-block { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 18px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        .info-block.full { grid-column: 1 / -1; }
        .label { 
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .value { 
          font-size: 16px;
          color: #f1f5f9;
          font-weight: 500;
        }
        .refund-highlight { 
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
          border-left: 4px solid #22c55e;
          padding: 18px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .refund-amount { 
          font-size: 18px;
          font-weight: 600;
          color: #22c55e;
        }
        .message {
          margin: 25px 0;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 20px;
          font-weight: 500;
          transition: transform 0.3s ease;
        }
        .button:hover { transform: translateY(-2px); }
        .footer { 
          text-align: center;
          color: #64748b;
          font-size: 12px;
          padding: 20px 30px;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          background: rgba(15, 23, 42, 0.5);
        }
        .divider { 
          height: 1px;
          background: rgba(59, 130, 246, 0.1);
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Reserva Cancelada</h1>
          <p>Tu reserva ha sido procesada</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hola <strong>${userName}</strong>,</div>
          
          <p class="message">
            Tu reserva ha sido cancelada exitosamente. A continuación encontrarás los detalles de tu cancelación y reembolso.
          </p>
          
          <div class="info-grid">
            <div class="info-block">
              <div class="label">Número de Reserva</div>
              <div class="value">${bookingNumber}</div>
            </div>
            <div class="info-block">
              <div class="label">Estado</div>
              <div class="value" style="color: #ef4444;">Cancelada</div>
            </div>
            <div class="info-block">
              <div class="label">Cabaña</div>
              <div class="value">${cabinTitle}</div>
            </div>
            <div class="info-block">
              <div class="label">Fechas</div>
              <div class="value">${new Date(checkIn).toLocaleDateString('es-ES')} - ${new Date(checkOut).toLocaleDateString('es-ES')}</div>
            </div>
          </div>
          
          <div class="refund-highlight">
            <div class="label" style="color: #22c55e;">Monto Reembolsado</div>
            <div class="refund-amount">$${totalPrice.toLocaleString('es-ES')}</div>
          </div>
          
          <p class="message">
            El reembolso será procesado en tu cuenta original dentro de 3-5 días hábiles. Si tienes preguntas sobre tu cancelación, por favor contacta con nuestro equipo de soporte.
          </p>
          
          <div class="divider"></div>
          
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            📞 ¿Necesitas ayuda? Contáctanos a través de nuestro panel de soporte
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Amanwal Cabañas. Este es un correo automático, por favor no responder.</p>
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
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header { 
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
          border-bottom: 1px solid rgba(34, 197, 94, 0.3);
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 8px;
          font-weight: 600;
        }
        .header p { 
          font-size: 14px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px;
          color: #e2e8f0;
        }
        .greeting { 
          font-size: 16px;
          margin-bottom: 20px;
          color: #cbd5e1;
        }
        .greeting strong { color: #f1f5f9; }
        .info-grid { 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 30px 0;
        }
        .info-block { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 18px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        .info-block.full { grid-column: 1 / -1; }
        .label { 
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          font-weight: 600;
        }
        .value { 
          font-size: 16px;
          color: #f1f5f9;
          font-weight: 500;
        }
        .price-highlight { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
          border-left: 4px solid #3b82f6;
          padding: 18px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .price-amount { 
          font-size: 24px;
          font-weight: 600;
          color: #3b82f6;
        }
        .message {
          margin: 25px 0;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 20px;
          font-weight: 500;
          transition: transform 0.3s ease;
        }
        .button:hover { transform: translateY(-2px); }
        .footer { 
          text-align: center;
          color: #64748b;
          font-size: 12px;
          padding: 20px 30px;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          background: rgba(15, 23, 42, 0.5);
        }
        .divider { 
          height: 1px;
          background: rgba(59, 130, 246, 0.1);
          margin: 25px 0;
        }
        .success-emoji { color: #22c55e; font-size: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><span class="success-emoji">✓</span> Reserva Confirmada</h1>
          <p>¡Tu booking está asegurado!</p>
        </div>
        
        <div class="content">
          <div class="greeting">¡Hola <strong>${userName}</strong>!</div>
          
          <p class="message">
            ¡Excelente! Tu reserva en Amanwal Cabañas ha sido confirmada exitosamente. A continuación encontrarás todos los detalles de tu estadía.
          </p>
          
          <div class="info-grid">
            <div class="info-block">
              <div class="label">Número de Reserva</div>
              <div class="value">${bookingNumber}</div>
            </div>
            <div class="info-block">
              <div class="label">Estado</div>
              <div class="value" style="color: #22c55e;">✓ Confirmada</div>
            </div>
            <div class="info-block">
              <div class="label">Cabaña</div>
              <div class="value">${cabinTitle}</div>
            </div>
            <div class="info-block">
              <div class="label">Fechas de Estadía</div>
              <div class="value">${new Date(checkIn).toLocaleDateString('es-ES')} - ${new Date(checkOut).toLocaleDateString('es-ES')}</div>
            </div>
          </div>
          
          <div class="price-highlight">
            <div class="label">Monto Total Pagado</div>
            <div class="price-amount">$${totalPrice.toLocaleString('es-ES')}</div>
          </div>
          
          <p class="message">
            🎉 ¡Tu cabaña está lista para recibirte! Te recomendamos arribar entre las 14:00 y las 18:00 horas. Si tienes alguna duda o necesitas información adicional sobre tu reserva, no dudes en contactarnos.
          </p>
          
          <div class="divider"></div>
          
          <p style="color: #94a3b8; font-size: 14px; text-align: center;">
            📍 Te esperamos en Amanwal Cabañas<br>
            📞 Cualquier consulta: contáctanos a través del panel de soporte
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Amanwal Cabañas. Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Plantilla de correo para verificación de email
export const getVerificationEmailTemplate = (
  userName: string,
  verificationUrl: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 20px;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 8px;
          font-weight: 600;
        }
        .header p { 
          font-size: 14px;
          opacity: 0.9;
        }
        .content { 
          padding: 40px 30px;
          color: #e2e8f0;
        }
        .greeting { 
          font-size: 16px;
          margin-bottom: 25px;
          color: #cbd5e1;
        }
        .greeting strong { color: #f1f5f9; }
        .message {
          margin: 20px 0;
          line-height: 1.6;
          color: #cbd5e1;
          font-size: 15px;
        }
        .verification-block { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border: 2px solid rgba(59, 130, 246, 0.3);
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
          text-align: center;
          backdrop-filter: blur(10px);
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        .button:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }
        .link-text {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(59, 130, 246, 0.2);
          font-size: 12px;
          color: #94a3b8;
          word-break: break-all;
        }
        .security-info {
          background: rgba(34, 197, 94, 0.1);
          border-left: 4px solid #22c55e;
          padding: 15px;
          margin: 25px 0;
          border-radius: 8px;
          font-size: 13px;
          color: #cbd5e1;
        }
        .security-info strong { color: #22c55e; }
        .footer { 
          text-align: center;
          color: #64748b;
          font-size: 12px;
          padding: 20px 30px;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          background: rgba(15, 23, 42, 0.5);
        }
        .logo-text {
          font-size: 14px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏡 Bienvenido a Amanwal</h1>
          <p>Completa tu registro en segundos</p>
        </div>
        
        <div class="content">
          <div class="greeting">¡Hola <strong>${userName}</strong>!</div>
          
          <p class="message">
            Gracias por registrarte en Amanwal. Para completar tu cuenta y comenzar a reservar nuestras increíbles cabañas, necesitamos verificar tu email.
          </p>
          
          <div class="verification-block">
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">Haz clic en el botón para verificar tu email:</p>
            <a href="${verificationUrl}" class="button">✓ Verificar Email</a>
            <div class="link-text">
              O copia este enlace en tu navegador:<br>
              <code style="color: #60a5fa; font-size: 11px;">${verificationUrl}</code>
            </div>
          </div>
          
          <div class="security-info">
            <strong>🔒 Seguridad:</strong> Este enlace expira en <strong>24 horas</strong>. No compartas este enlace con nadie.
          </div>
          
          <p class="message">
            Una vez verificado tu email, podrás acceder a tu cuenta completa y explorar todas nuestras cabañas disponibles.
          </p>
          
          <p class="message">
            Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
          </p>
        </div>
        
        <div class="footer">
          <p class="logo-text">© 2025 Amanwal Cabañas - Tu destino de ensueño</p>
          <p>Este es un correo automático, por favor no responder.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
