import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../../../appointment/domain/repositories/appointment.repository';
import { MailService } from '../../../shared/mail/mail.service';
import { PatientLookupPort } from '../../domain/ports/patient-lookup.port';
import { DentistLookupPort } from '../../domain/ports/dentist-lookup.port';

// Ventana de "recordar 24h antes": se calcula sobre `now` en cada corrida, no
// sobre un valor fijo — ver appointment-reminder.cron.ts para el porqué del
// tamaño de la ventana (debe coincidir con el intervalo del cron).
const REMINDER_WINDOW_HOURS = 24;

@Injectable()
export class SendAppointmentRemindersUseCase {
  private readonly logger = new Logger(SendAppointmentRemindersUseCase.name);

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientLookup: PatientLookupPort,
    private readonly dentistLookup: DentistLookupPort,
    private readonly mailService: MailService,
  ) {}

  async execute(intervalMinutes: number): Promise<void> {
    const now = new Date();
    const windowStart = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 3_600_000);
    const windowEnd = new Date(windowStart.getTime() + intervalMinutes * 60_000);

    const dueAppointments = await this.appointmentRepository.findDueForReminder(
      windowStart,
      windowEnd,
    );

    for (const appointment of dueAppointments) {
      try {
        const patient = await this.patientLookup.findById(String(appointment.patient));
        if (!patient?.email) {
          // Sin email registrado no hay a quién avisar — no es un error, se
          // salta sin marcar reminderSentAt (si más adelante se le carga un
          // email, la cita seguirá elegible en corridas futuras dentro de la
          // ventana... salvo que ya haya pasado la ventana de 24h, caso
          // aceptable dado que es un dato faltante del paciente).
          continue;
        }
        const dentist = await this.dentistLookup.findById(String(appointment.dentist));

        await this.mailService.sendAppointmentReminderEmail(patient.email, {
          patientName: patient.name,
          dentistName: dentist?.name ?? 'tu odontólogo',
          startAt: appointment.startAt,
        });
        await this.appointmentRepository.markReminderSent(String(appointment._id));
      } catch (error) {
        // Un fallo de Resend o de un lookup puntual no debe frenar el resto
        // del batch ni el cron — mismo criterio que ForgotPasswordUseCase con
        // el email de reseteo de contraseña.
        this.logger.error(
          `No se pudo enviar el recordatorio de la cita ${appointment._id}`,
          error,
        );
      }
    }
  }
}
