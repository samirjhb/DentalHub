import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappController } from './infrastructure/controllers/whatsapp.controller';
import { WhatsappGateway } from './domain/gateways/whatsapp.gateway';
import { MetaWhatsappAdapter } from './infrastructure/adapters/meta-whatsapp.adapter';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { SendTemplateUseCase } from './application/use-cases/send-template.use-case';
import { SendAppointmentAlertUseCase } from './application/use-cases/send-appointment-alert.use-case';
import { SendDefaultTestMessageUseCase } from './application/use-cases/send-default-test-message.use-case';
import { ReceiveWebhookUseCase } from './application/use-cases/receive-webhook.use-case';
import { ReceiveMessageStatusUseCase } from './application/use-cases/receive-message-status.use-case';

@Module({
  imports: [ConfigModule],
  controllers: [WhatsappController],
  providers: [
    { provide: WhatsappGateway, useClass: MetaWhatsappAdapter },
    SendMessageUseCase,
    SendTemplateUseCase,
    SendAppointmentAlertUseCase,
    SendDefaultTestMessageUseCase,
    ReceiveWebhookUseCase,
    ReceiveMessageStatusUseCase,
  ],
})
export class WhatsappModule {}
