import { Injectable } from '@nestjs/common';
import { WhatsappGateway } from '../../domain/gateways/whatsapp.gateway';

@Injectable()
export class SendAppointmentAlertUseCase {
  constructor(private readonly gateway: WhatsappGateway) {}

  async execute(recipientNumber: string, patientName: string, dateTime: string) {
    const message = `Hola ${patientName}, le recordamos que tiene una cita programada para ${dateTime}. Por favor confirme su asistencia.`;
    return this.gateway.sendTextMessage(recipientNumber, message);
  }
}
