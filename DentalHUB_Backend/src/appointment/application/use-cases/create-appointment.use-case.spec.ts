import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { InMemoryAppointmentRepository } from '../testing/in-memory-appointment.repository';

describe('CreateAppointmentUseCase', () => {
  let repository: InMemoryAppointmentRepository;
  let useCase: CreateAppointmentUseCase;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    useCase = new CreateAppointmentUseCase(repository);
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
});
