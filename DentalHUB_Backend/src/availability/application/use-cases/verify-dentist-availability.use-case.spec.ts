import { VerifyDentistAvailabilityUseCase } from './verify-dentist-availability.use-case';
import { InMemoryAvailabilityRepository } from '../testing/in-memory-availability.repository';
import { SlotCalculatorService } from '../services/slot-calculator.service';

describe('VerifyDentistAvailabilityUseCase', () => {
  let repository: InMemoryAvailabilityRepository;
  let useCase: VerifyDentistAvailabilityUseCase;

  beforeEach(() => {
    repository = new InMemoryAvailabilityRepository();
    useCase = new VerifyDentistAvailabilityUseCase(repository, new SlotCalculatorService());
  });

  // 2026-01-10 es sábado (dayOfWeek 6) en America/Santiago. En enero (verano)
  // Santiago es GMT-3, así que 10:00-11:00 hora Santiago = 13:00-14:00 UTC.
  const saturdayInsideHours = {
    startAt: new Date('2026-01-10T13:00:00.000Z'), // 10:00 Santiago
    endAt: new Date('2026-01-10T14:00:00.000Z'), // 11:00 Santiago
  };
  // 18:00-19:00 hora Santiago = 21:00-22:00 UTC — fuera del bloque 09:00-13:00.
  const saturdayOutsideHours = {
    startAt: new Date('2026-01-10T21:00:00.000Z'),
    endAt: new Date('2026-01-10T22:00:00.000Z'),
  };

  it('is permissive when the dentist has no schedule configured', async () => {
    const result = await useCase.execute(
      'dentist-1',
      saturdayInsideHours.startAt,
      saturdayInsideHours.endAt,
    );
    expect(result).toBe(true);
  });

  it('returns true when the appointment fits inside a working block', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    const result = await useCase.execute(
      'dentist-1',
      saturdayInsideHours.startAt,
      saturdayInsideHours.endAt,
    );
    expect(result).toBe(true);
  });

  it('returns false when the appointment falls outside every working block', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    const result = await useCase.execute(
      'dentist-1',
      saturdayOutsideHours.startAt,
      saturdayOutsideHours.endAt,
    );
    expect(result).toBe(false);
  });

  it('returns false on an all-day blocked date even if inside working hours', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    await repository.createException('dentist-1', {
      date: new Date('2026-01-10T00:00:00.000Z'),
      allDay: true,
    });

    const result = await useCase.execute(
      'dentist-1',
      saturdayInsideHours.startAt,
      saturdayInsideHours.endAt,
    );
    expect(result).toBe(false);
  });

  it('returns false when a partial exception overlaps the requested time', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    await repository.createException('dentist-1', {
      date: new Date('2026-01-10T00:00:00.000Z'),
      allDay: false,
      startTime: '10:00',
      endTime: '11:00',
    });

    const result = await useCase.execute(
      'dentist-1',
      saturdayInsideHours.startAt,
      saturdayInsideHours.endAt,
    );
    expect(result).toBe(false);
  });

  it('returns true when a partial exception does not overlap the requested time', async () => {
    repository.seedSchedule('dentist-1', [
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ]);
    await repository.createException('dentist-1', {
      date: new Date('2026-01-10T00:00:00.000Z'),
      allDay: false,
      startTime: '11:00',
      endTime: '12:00',
    });

    const result = await useCase.execute(
      'dentist-1',
      saturdayInsideHours.startAt,
      saturdayInsideHours.endAt,
    );
    expect(result).toBe(true);
  });
});
