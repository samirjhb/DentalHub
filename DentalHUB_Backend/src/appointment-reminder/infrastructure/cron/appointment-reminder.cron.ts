import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SendAppointmentRemindersUseCase } from '../../application/use-cases/send-appointment-reminders.use-case';

// Cada 15 min: la ventana que abre el use-case (now+24h a now+24h+15min)
// barre la marca de "24h antes" exactamente una vez por cita, sin huecos ni
// superposición — el dedup real lo da `reminderSentAt`, esta cadencia solo
// evita escanear toda la tabla de citas futuras en cada corrida.
const CRON_INTERVAL_MINUTES = 15;

@Injectable()
export class AppointmentReminderCron {
  constructor(private readonly useCase: SendAppointmentRemindersUseCase) {}

  @Cron('*/15 * * * *')
  async handleReminders(): Promise<void> {
    await this.useCase.execute(CRON_INTERVAL_MINUTES);
  }
}
