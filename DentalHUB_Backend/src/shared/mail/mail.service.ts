import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// Vía la API HTTPS de Resend (fetch nativo, sin dependencias nuevas) — mismo
// patrón ya probado en el proyecto hermano hadebot-backend
// (src/routes/contact.js), adoptado acá porque muchos hosts gratuitos
// bloquean SMTP saliente y la API HTTPS no depende de ese puerto.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      // Sin API key no hay forma de enviar el correo de verdad — se loguea el
      // contenido completo para poder seguir probando el flujo en desarrollo
      // local sin depender de una cuenta de Resend configurada.
      this.logger.warn(
        `RESEND_API_KEY no configurada — no se envía email a ${to}\nAsunto: ${subject}\n${html}`,
      );
      return;
    }

    const from =
      this.configService.get<string>('RESEND_FROM') ||
      'DentalHub <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    await this.sendMail({
      to,
      subject: 'Recupera tu contraseña — DentalHub',
      html: `
        <p>Recibimos una solicitud para restablecer tu contraseña en DentalHub.</p>
        <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a></p>
        <p>Si no fuiste tú, puedes ignorar este correo — tu contraseña actual sigue siendo válida.</p>
      `,
    });
  }
}
