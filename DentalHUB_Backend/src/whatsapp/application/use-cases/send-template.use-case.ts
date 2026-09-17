import { Injectable } from '@nestjs/common';
import { WhatsappGateway } from '../../domain/gateways/whatsapp.gateway';

@Injectable()
export class SendTemplateUseCase {
  constructor(private readonly gateway: WhatsappGateway) {}

  async execute(
    phoneNumber: string,
    templateName: string,
    languageCode?: string,
  ) {
    return this.gateway.sendTemplateMessage(
      phoneNumber,
      templateName,
      languageCode,
    );
  }
}
