import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappGateway } from '../../domain/gateways/whatsapp.gateway';

@Injectable()
export class SendDefaultTestMessageUseCase {
  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly configService: ConfigService,
  ) {}

  async execute() {
    const defaultRecipient = this.configService.get<string>(
      'DEFAULT_RECIPIENT_NUMBER',
    );

    if (!defaultRecipient) {
      throw new Error('No default recipient number configured');
    }

    // Enviar un mensaje de plantilla hello_world como ejemplo
    return this.gateway.sendTemplateMessage(
      defaultRecipient,
      'hello_world',
      'en_US',
    );
  }
}
