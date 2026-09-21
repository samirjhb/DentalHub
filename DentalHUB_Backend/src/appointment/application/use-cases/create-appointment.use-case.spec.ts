import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { InMemoryAppointmentRepository } from '../testing/in-memory-appointment.repository';
import { InMemoryAvailabilityRepository } from '../../../availability/application/testing/in-memory-availability.repository';
import { SlotCalculatorService } from '../../../availability/application/services/slot-calculator.service';
import { VerifyDentistAvailabilityUseCase } from '../../../availability/application/use-cases/verify-dentist-availability.use-case';

describe('CreateAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let availabilityRepository: InMemoryAvailabilityRepository;
  let useCase: CreateAppointmentUseCase;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    availabilityRepository = new InMemoryAvailabilityRepository();
    const verifyDentistAvailability = new VerifyDentistAvailabilityUseCase(
      availabilityRepository,
      new SlotCalculatorService(),
    );
    // Sin horario configurado, VerifyDentistAvailabilityUseCase es permisivo
    // por defecto (ver A.5 del plan) — no afecta a los tests existentes que no
    // siembran horario.
    useCase = new CreateAppointmentUseCase(repository, verifyDentistAvailability);
  });

  const baseDto = {
    patient: 'patient-1',
    dentist: 'dentist-1',
    startAt: '2026-01-10T10:00:00.000Z',
    durationMinutes: 60,
    reason: 'Control de rutina',
  };

  it('throws NotFoundException when the patient does not exist', async () => {
    repository.seedDentist('dentist-1');
    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the dentist does not exist', async () => {
    repository.seedPatient('patient-1');
    await expect(useCase.execute(baseDto)).rejects.toThrow(NotFoundException);
  });

  it('creates the appointment when patient and dentist exist and there is no overlap', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');

    const result = await useCase.execute(baseDto);

    expect(result.status).toBe('Pendiente');
    expect(result.reason).toBe('Control de rutina');
  });

  it('rejects a second appointment for the same dentist in an overlapping time slot', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    await useCase.execute(baseDto);

    await expect(
      useCase.execute({
        ...baseDto,
        startAt: '2026-01-10T10:30:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows a non-overlapping appointment for the same dentist', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    await useCase.execute(baseDto);

    const result = await useCase.execute({
      ...baseDto,
      startAt: '2026-01-10T11:00:00.000Z',
    });
    expect(result.status).toBe('Pendiente');
  });

  it('rejects an appointment outside the dentist working hours', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    availabilityRepository.seedDentist('dentist-1');
    // 2026-01-10 es sábado (dayOfWeek 6); el horario solo cubre 09:00-13:00
    // hora Santiago (12:00-16:00 UTC en enero, GMT-3).
    availabilityRepository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);

    await expect(
      useCase.execute({ ...baseDto, startAt: '2026-01-10T18:00:00.000Z' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows an appointment inside the configured working hours', async () => {
    repository.seedPatient('patient-1');
    repository.seedDentist('dentist-1');
    availabilityRepository.seedDentist('dentist-1');
    availabilityRepository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);

    // 12:00 UTC = 09:00 hora Santiago, dentro del bloque.
    const result = await useCase.execute({
      ...baseDto,
      startAt: '2026-01-10T12:00:00.000Z',
    });
    expect(result.status).toBe('Pendiente');
  });
});
