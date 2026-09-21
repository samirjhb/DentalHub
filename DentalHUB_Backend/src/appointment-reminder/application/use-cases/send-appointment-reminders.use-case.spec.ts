import { SendAppointmentRemindersUseCase } from './send-appointment-reminders.use-case';
import { InMemoryAppointmentRepository } from '../../../appointment/application/testing/in-memory-appointment.repository';
import { InMemoryPatientLookup } from '../testing/in-memory-patient-lookup';
import { InMemoryDentistLookup } from '../testing/in-memory-dentist-lookup';
import { MailService } from '../../../shared/mail/mail.service';
import { AppointmentStatus } from '../../../appointment/domain/entities/appointment-status.enum';

const INTERVAL_MINUTES = 15;

describe('SendAppointmentRemindersUseCase', () => {
  let appointmentRepository: InMemoryAppointmentRepository;
  let patientLookup: InMemoryPatientLookup;
  let dentistLookup: InMemoryDentistLookup;
  let mailService: { sendAppointmentReminderEmail: jest.Mock };
  let useCase: SendAppointmentRemindersUseCase;

  // ~24h en el futuro, dentro de la ventana que abre execute() para
  // INTERVAL_MINUTES=15 (algunos ms de holgura para el drift del test).
  const dueStartAt = () => new Date(Date.now() + 24 * 3_600_000 + 2 * 60_000);

  beforeEach(() => {
    appointmentRepository = new InMemoryAppointmentRepository();
    patientLookup = new InMemoryPatientLookup();
    dentistLookup = new InMemoryDentistLookup();
    mailService = { sendAppointmentReminderEmail: jest.fn().mockResolvedValue(undefined) };
    useCase = new SendAppointmentRemindersUseCase(
      appointmentRepository,
      patientLookup,
      dentistLookup,
      mailService as unknown as MailService,
    );

    appointmentRepository.seedPatient('patient-1');
    appointmentRepository.seedDentist('dentist-1');
    patientLookup.seed('patient-1', { name: 'Ana', email: 'ana@test.com' });
    dentistLookup.seed('dentist-1', { name: 'Dr. Pérez' });
  });

  it('sends the reminder and marks reminderSentAt for an appointment due in ~24h', async () => {
    const appointment = await appointmentRepository.create({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });

    await useCase.execute(INTERVAL_MINUTES);

    expect(mailService.sendAppointmentReminderEmail).toHaveBeenCalledTimes(1);
    expect(mailService.sendAppointmentReminderEmail).toHaveBeenCalledWith(
      'ana@test.com',
      expect.objectContaining({ patientName: 'Ana', dentistName: 'Dr. Pérez' }),
    );
    const updated = await appointmentRepository.findById(String(appointment._id));
    expect(updated!.reminderSentAt).not.toBeNull();
  });

  it('skips an appointment whose reminder was already sent', async () => {
    const appointment = await appointmentRepository.create({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });
    await appointmentRepository.markReminderSent(String(appointment._id));

    await useCase.execute(INTERVAL_MINUTES);

    expect(mailService.sendAppointmentReminderEmail).not.toHaveBeenCalled();
  });

  it('skips a cancelled appointment', async () => {
    const appointment = await appointmentRepository.create({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });
    await appointmentRepository.updateStatus(String(appointment._id), AppointmentStatus.CANCELADA);

    await useCase.execute(INTERVAL_MINUTES);

    expect(mailService.sendAppointmentReminderEmail).not.toHaveBeenCalled();
  });

  it('skips an appointment when the patient has no email on file', async () => {
    patientLookup.seed('patient-1', { name: 'Ana', email: '' });
    await appointmentRepository.create({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });

    await useCase.execute(INTERVAL_MINUTES);

    expect(mailService.sendAppointmentReminderEmail).not.toHaveBeenCalled();
  });

  it('logs the error and keeps processing the rest of the batch when sending fails for one appointment', async () => {
    appointmentRepository.seedPatient('patient-2');
    patientLookup.seed('patient-2', { name: 'Beto', email: 'beto@test.com' });

    const failing = await appointmentRepository.create({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });
    const ok = await appointmentRepository.create({
      patient: 'patient-2',
      dentist: 'dentist-1',
      startAt: dueStartAt(),
      endAt: new Date(dueStartAt().getTime() + 3_600_000),
      durationMinutes: 60,
      reason: 'Control',
    });
    mailService.sendAppointmentReminderEmail
      .mockRejectedValueOnce(new Error('Resend caído'))
      .mockResolvedValueOnce(undefined);

    await expect(useCase.execute(INTERVAL_MINUTES)).resolves.toBeUndefined();

    expect(mailService.sendAppointmentReminderEmail).toHaveBeenCalledTimes(2);
    const failingUpdated = await appointmentRepository.findById(String(failing._id));
    const okUpdated = await appointmentRepository.findById(String(ok._id));
    expect(failingUpdated!.reminderSentAt).toBeNull();
    expect(okUpdated!.reminderSentAt).not.toBeNull();
  });
});
