import { SlotCalculatorService } from './slot-calculator.service';

describe('SlotCalculatorService', () => {
  let service: SlotCalculatorService;

  beforeEach(() => {
    service = new SlotCalculatorService();
  });

  it('excludes slots that already started relative to `now`', () => {
    // 2026-01-10 es sábado; bloque 09:00-13:00 Santiago = 12:00-16:00 UTC.
    // `now` cae a mitad del bloque (14:00 UTC = 11:00 Santiago).
    const result = service.computeFreeSlots({
      date: new Date('2026-01-10T00:00:00.000Z'),
      workingBlocks: [{ dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }],
      isAllDayBlocked: false,
      partialBlockedRanges: [],
      busyRanges: [],
      durationMinutes: 60,
      now: new Date('2026-01-10T14:00:00.000Z'),
    });

    expect(result.map((d) => d.toISOString())).toEqual([
      '2026-01-10T14:30:00.000Z',
      '2026-01-10T15:00:00.000Z',
    ]);
  });

  it('returns every slot when `now` is before the working block starts', () => {
    const result = service.computeFreeSlots({
      date: new Date('2026-01-10T00:00:00.000Z'),
      workingBlocks: [{ dayOfWeek: 6, startTime: '09:00', endTime: '11:00' }],
      isAllDayBlocked: false,
      partialBlockedRanges: [],
      busyRanges: [],
      durationMinutes: 60,
      now: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(result.map((d) => d.toISOString())).toEqual([
      '2026-01-10T12:00:00.000Z',
      '2026-01-10T12:30:00.000Z',
      '2026-01-10T13:00:00.000Z',
    ]);
  });

  it('returns an empty list when `now` is after the working block ends', () => {
    const result = service.computeFreeSlots({
      date: new Date('2026-01-10T00:00:00.000Z'),
      workingBlocks: [{ dayOfWeek: 6, startTime: '09:00', endTime: '11:00' }],
      isAllDayBlocked: false,
      partialBlockedRanges: [],
      busyRanges: [],
      durationMinutes: 60,
      now: new Date('2026-01-10T20:00:00.000Z'),
    });

    expect(result).toEqual([]);
  });
});
