import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SendMessageDto } from '../../application/dto/send-message.dto';
import { AlertaCitaDto } from '../../application/dto/alerta-cita.dto';
import { SendTemplateDto } from '../../application/dto/send-template.dto';
import { WhatsappWebhookDto } from '../../application/dto/whatsapp-webhook.dto';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { SendTemplateUseCase } from '../../application/use-cases/send-template.use-case';
import { SendAppointmentAlertUseCase } from '../../application/use-cases/send-appointment-alert.use-case';
import { SendDefaultTestMessageUseCase } from '../../application/use-cases/send-default-test-message.use-case';
import { ReceiveWebhookUseCase } from '../../application/use-cases/receive-webhook.use-case';
import { ReceiveMessageStatusUseCase } from '../../application/use-cases/receive-message-status.use-case';
import { JwtAuthGuard } from 'src/shared/security/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

const STAFF_MESSAGING_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
];

@ApiTags('Whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly sendTemplateUseCase: SendTemplateUseCase,
    private readonly sendAppointmentAlertUseCase: SendAppointmentAlertUseCase,
    private readonly sendDefaultTestMessageUseCase: SendDefaultTestMessageUseCase,
    private readonly receiveWebhookUseCase: ReceiveWebhookUseCase,
    private readonly receiveMessageStatusUseCase: ReceiveMessageStatusUseCase,
  ) {}

  @Get('test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_MESSAGING_ROLES)
  @ApiOperation({
    summary: 'Enviar un mensaje de prueba usando la configuración por defecto',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de prueba enviado correctamente',
  })
  alertaCitaController(): any {
    return this.sendDefaultTestMessageUseCase.execute();
  }

  @Post('send-message')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_MESSAGING_ROLES)
  @ApiOperation({
    summary: 'Enviar un mensaje de WhatsApp a un número específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje enviado correctamente',
  })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<any> {
    return this.sendMessageUseCase.execute(
      sendMessageDto.phoneNumber,
      sendMessageDto.message,
    );
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Recibir notificaciones de WhatsApp (Webhook)',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación recibida correctamente',
  })
  @ApiBody({ type: WhatsappWebhookDto })
  // Desactivamos la validación estricta para este endpoint
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  )
  async receiveWebhook(@Body() webhookData: any): Promise<any> {
    return this.receiveWebhookUseCase.execute(webhookData);
  }

  // Endpoint específico para recibir el formato exacto que estás enviando
  @Post('message-status')
  @ApiOperation({
    summary: 'Recibir estado de mensajes de WhatsApp',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de mensaje recibido correctamente',
  })
  @UsePipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false, // No transformamos para mantener el formato original
    }),
  )
  async receiveMessageStatus(@Body() rawData: any): Promise<any> {
    return this.receiveMessageStatusUseCase.execute(rawData);
  }

  @Post('send-template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_MESSAGING_ROLES)
  @ApiOperation({
    summary: 'Enviar un mensaje de plantilla de WhatsApp',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de plantilla enviado correctamente',
  })
  @ApiBody({ type: SendTemplateDto })
  async sendTemplate(@Body() sendTemplateDto: SendTemplateDto): Promise<any> {
    return this.sendTemplateUseCase.execute(
      sendTemplateDto.phoneNumber,
      sendTemplateDto.templateName,
      sendTemplateDto.languageCode,
    );
  }

  @Post('alerta-cita')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_MESSAGING_ROLES)
  @ApiOperation({ summary: 'Enviar una alerta de cita a un paciente' })
  @ApiResponse({
    status: 200,
    description: 'Alerta de cita enviada correctamente',
  })
  @ApiBody({ type: AlertaCitaDto })
  async alertaCita(@Body() alertaCitaDto: AlertaCitaDto): Promise<any> {
    return this.sendAppointmentAlertUseCase.execute(
      alertaCitaDto.phoneNumber,
      alertaCitaDto.patientName,
      alertaCitaDto.dateTime,
    );
  }
}
