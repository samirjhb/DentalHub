import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { RescheduleAppointmentUseCase } from './reschedule-appointment.use-case';
import { InMemoryAppointmentRepository } from '../testing/in-memory-appointment.repository';

describe('RescheduleAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let createUseCase: CreateAppointmentUseCase;
  let rescheduleUseCase: RescheduleAppointmentUseCase;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    createUseCase = new CreateAppointmentUseCase(repository);
    rescheduleUseCase = new RescheduleAppointmentUseCase(repository);
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
  });

  it('throws NotFoundException when the appointment does not exist', async () => {
    await expect(
      rescheduleUseCase.execute('missing-id', {
        startAt: '2026-01-10T12:00:00.000Z',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('reschedules to a free time slot', async () => {
    const created = await createUseCase.execute({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: '2026-01-10T10:00:00.000Z',
      durationMinutes: 60,
      reason: 'Control',
    });

    const result = await rescheduleUseCase.execute(String(created._id), {
      startAt: '2026-01-10T15:00:00.000Z',
    });

    expect(new Date(result.startAt).toISOString()).toBe(
      '2026-01-10T15:00:00.000Z',
    );
  });

  it('rejects rescheduling into a slot that collides with another appointment of the same dentist', async () => {
    await createUseCase.execute({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: '2026-01-10T10:00:00.000Z',
      durationMinutes: 60,
      reason: 'Control',
    });
    const second = await createUseCase.execute({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: '2026-01-10T12:00:00.000Z',
      durationMinutes: 60,
      reason: 'Control',
    });

    await expect(
      rescheduleUseCase.execute(String(second._id), {
        startAt: '2026-01-10T10:30:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
