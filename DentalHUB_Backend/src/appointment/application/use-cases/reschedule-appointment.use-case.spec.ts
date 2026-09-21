import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { RescheduleAppointmentUseCase } from './reschedule-appointment.use-case';
import { InMemoryAppointmentRepository } from '../testing/in-memory-appointment.repository';
import { InMemoryAvailabilityRepository } from '../../../availability/application/testing/in-memory-availability.repository';
import { SlotCalculatorService } from '../../../availability/application/services/slot-calculator.service';
import { VerifyDentistAvailabilityUseCase } from '../../../availability/application/use-cases/verify-dentist-availability.use-case';

describe('RescheduleAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let availabilityRepository: InMemoryAvailabilityRepository;
  let createUseCase: CreateAppointmentUseCase;
  let rescheduleUseCase: RescheduleAppointmentUseCase;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    availabilityRepository = new InMemoryAvailabilityRepository();
    const verifyDentistAvailability = new VerifyDentistAvailabilityUseCase(
      availabilityRepository,
      new SlotCalculatorService(),
    );
    createUseCase = new CreateAppointmentUseCase(repository, verifyDentistAvailability);
    rescheduleUseCase = new RescheduleAppointmentUseCase(repository, verifyDentistAvailability);
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

  it('rejects rescheduling outside the dentist working hours', async () => {
    availabilityRepository.seedDentist('dentist-1');
    // 09:00-13:00 hora Santiago = 12:00-16:00 UTC en enero (GMT-3).
    availabilityRepository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    const created = await createUseCase.execute({
      patient: 'patient-1',
      dentist: 'dentist-1',
      startAt: '2026-01-10T12:00:00.000Z',
      durationMinutes: 60,
      reason: 'Control',
    });

    await expect(
      rescheduleUseCase.execute(String(created._id), {
        startAt: '2026-01-10T18:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
