import { Injectable } from '@nestjs/common';
import { WhatsappGateway } from '../../domain/gateways/whatsapp.gateway';

@Injectable()
export class SendMessageUseCase {
  constructor(private readonly gateway: WhatsappGateway) {}

  async execute(phoneNumber: string, message: string) {
    console.log('Received DTO:', { phoneNumber, message });
    console.log('Sending WhatsApp message to:', phoneNumber);
    console.log('Message:', message);
    return this.gateway.sendTextMessage(phoneNumber, message);
  }
}
