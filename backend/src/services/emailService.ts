import nodemailer from 'nodemailer';

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"🏡 Amanwal Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error };
  }
};

// Template de confirmación de ticket creado
export const getTicketCreatedTemplate = (ticketNumber: string, title: string, userEmail: string, frontendUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #16213e 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎫 ¡Ticket Creado!</h1>
        <p style="margin: 15px 0; font-size: 16px; opacity: 0.9;">Tu solicitud de soporte ha sido registrada exitosamente</p>
      </div>

      <div style="background: #f8f9fa; padding: 25px; margin: 20px 0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Detalles de tu Ticket</h2>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0;">
          <p style="margin: 8px 0;"><strong>Número de Ticket:</strong> <code style="background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">${ticketNumber}</code></p>
          <p style="margin: 8px 0;"><strong>Asunto:</strong> ${title}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${userEmail}</p>
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px;">🟢 Abierto</span></p>
        </div>

        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #60a5fa; margin: 15px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0c4a6e;">¿Qué sigue?</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Nuestro equipo revisará tu solicitud en breve</li>
            <li>Recibirás actualizaciones por email</li>
            <li>Puedes ver el estado en tu cuenta</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${frontendUrl}/my-tickets" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Ver mi Ticket</a>
        </div>
      </div>

      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #7c2d12; font-size: 14px;">
          <strong>💡 Tip:</strong> Guarda este número de ticket para futuras referencias: <code style="background: #fed7aa; padding: 2px 6px; border-radius: 4px;">${ticketNumber}</code>
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
        <p>© 2025 Amanwal. Todos los derechos reservados.</p>
        <p>Este es un email automático, por favor no responder directamente.</p>
      </div>
    </div>
  `;
};

// Template de nueva respuesta en ticket
export const getTicketResponseTemplate = (ticketNumber: string, responderName: string, message: string, frontendUrl: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #16213e 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💬 Nueva Respuesta en tu Ticket</h1>
        <p style="margin: 15px 0; font-size: 16px; opacity: 0.9;">El equipo de soporte ha respondido a tu solicitud</p>
      </div>

      <div style="background: #f8f9fa; padding: 25px; margin: 20px 0; border-radius: 8px;">
        <p style="color: #0f172a; margin-bottom: 15px;"><strong>Ticket:</strong> ${ticketNumber}</p>
        
        <div style="background: white; padding: 15px; border-left: 4px solid #60a5fa; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 8px 0; color: #666;"><strong>🎧 ${responderName}</strong></p>
          <p style="margin: 15px 0; color: #0f172a; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${frontendUrl}/my-tickets" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Ver Conversación Completa</a>
        </div>
      </div>

      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
        <p>© 2025 Amanwal. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
};
