import { NotFoundException } from '@nestjs/common';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';
import { InMemoryAvailabilityRepository } from '../testing/in-memory-availability.repository';
import { SlotCalculatorService } from '../services/slot-calculator.service';

// Anterior a todas las fechas de prueba (2026-01-10) — el use-case ahora
// descarta slots que ya empezaron respecto a `now`, así que los tests deben
// fijarlo explícitamente en vez de depender del reloj real.
const FIXED_NOW = new Date('2026-01-01T00:00:00.000Z');

describe('GetAvailableSlotsUseCase', () => {
  let repository: InMemoryAvailabilityRepository;
  let useCase: GetAvailableSlotsUseCase;

  beforeEach(() => {
    repository = new InMemoryAvailabilityRepository();
    useCase = new GetAvailableSlotsUseCase(repository, new SlotCalculatorService());
    repository.seedDentist('dentist-1');
  });

  it('throws NotFoundException when the dentist does not exist', async () => {
    await expect(
      useCase.execute({ dentistId: 'ghost', date: '2026-01-10' }, FIXED_NOW),
    ).rejects.toThrow(NotFoundException);
  });

  it('returns an empty list when the dentist has no schedule for that day', async () => {
    const result = await useCase.execute({ dentistId: 'dentist-1', date: '2026-01-10' }, FIXED_NOW);
    expect(result.slots).toEqual([]);
  });

  it('returns hourly slots for a simple morning block', async () => {
    // 2026-01-10 es sábado (dayOfWeek 6). En enero (verano) Santiago es
    // GMT-3, así que 09:00-11:00 hora Santiago = 12:00-14:00 UTC.
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
    ]);

    const result = await useCase.execute({
      dentistId: 'dentist-1',
      date: '2026-01-10',
      durationMinutes: 60,
    }, FIXED_NOW);

    expect(result.slots).toEqual([
      '2026-01-10T12:00:00.000Z',
      '2026-01-10T12:30:00.000Z',
      '2026-01-10T13:00:00.000Z',
    ]);
  });

  it('skips the lunch gap between AM/PM blocks', async () => {
    // 09:00-10:00 y 14:00-15:00 hora Santiago = 12:00-13:00 y 17:00-18:00 UTC.
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '10:00' },
      { dayOfWeek: 6, startTime: '14:00', endTime: '15:00' },
    ]);

    const result = await useCase.execute({
      dentistId: 'dentist-1',
      date: '2026-01-10',
      durationMinutes: 60,
    }, FIXED_NOW);

    expect(result.slots).toEqual([
      '2026-01-10T12:00:00.000Z',
      '2026-01-10T17:00:00.000Z',
    ]);
  });

  it('returns an empty list on an all-day blocked date', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    await repository.createException('dentist-1', {
      date: new Date('2026-01-10T00:00:00.000Z'),
      allDay: true,
    });

    const result = await useCase.execute({ dentistId: 'dentist-1', date: '2026-01-10' }, FIXED_NOW);
    expect(result.slots).toEqual([]);
  });

  it('excludes only the blocked range on a partial exception', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
    ]);
    await repository.createException('dentist-1', {
      date: new Date('2026-01-10T00:00:00.000Z'),
      allDay: false,
      startTime: '09:00',
      endTime: '10:00',
    });

    const result = await useCase.execute({
      dentistId: 'dentist-1',
      date: '2026-01-10',
      durationMinutes: 60,
    }, FIXED_NOW);

    expect(result.slots).toEqual(['2026-01-10T13:00:00.000Z']);
  });

  it('excludes slots that overlap an existing appointment', async () => {
    // Bloque 09:00-11:00 Santiago = 12:00-14:00 UTC; la cita ocupa la
    // primera hora (12:00-13:00 UTC = 09:00-10:00 Santiago).
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '11:00' },
    ]);
    repository.seedBusyRanges('dentist-1', [
      {
        startAt: new Date('2026-01-10T12:00:00.000Z'),
        endAt: new Date('2026-01-10T13:00:00.000Z'),
      },
    ]);

    const result = await useCase.execute({
      dentistId: 'dentist-1',
      date: '2026-01-10',
      durationMinutes: 60,
    }, FIXED_NOW);

    expect(result.slots).toEqual(['2026-01-10T13:00:00.000Z']);
  });
});
