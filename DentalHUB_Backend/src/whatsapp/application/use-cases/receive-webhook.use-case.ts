import { Injectable } from '@nestjs/common';
import { WhatsappGateway } from '../../domain/gateways/whatsapp.gateway';

@Injectable()
export class ReceiveWebhookUseCase {
  constructor(private readonly gateway: WhatsappGateway) {}

  async execute(webhookData: any) {
    console.log('Received webhook data:', webhookData);

    // Extraer el número de teléfono del primer contacto si existe
    const phoneNumber = webhookData.contacts?.[0]?.input;

    if (phoneNumber) {
      // Enviar un mensaje de confirmación
      await this.gateway.sendTextMessage(
        phoneNumber,
        'Hemos recibido tu mensaje. Gracias por contactarnos.',
      );
    }

    return { status: 'success', message: 'Webhook received' };
  }
}
