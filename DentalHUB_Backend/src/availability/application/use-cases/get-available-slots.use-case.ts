import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { SlotCalculatorService } from '../services/slot-calculator.service';
import { AvailableSlotsQueryDto } from '../dto/available-slots-query.dto';
import { zonedTimeToUtc } from '../../../shared/utils/clinic-timezone.util';

const DEFAULT_DURATION_MINUTES = 60;

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    private readonly repository: AvailabilityRepository,
    private readonly slotCalculator: SlotCalculatorService,
  ) {}

  async execute(query: AvailableSlotsQueryDto): Promise<{ slots: string[] }> {
    const dentistExists = await this.repository.verifyDentistExists(query.dentistId);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${query.dentistId} no encontrado`);
    }

    const date = new Date(query.date);
    date.setUTCHours(0, 0, 0, 0);
    const durationMinutes = query.durationMinutes ?? DEFAULT_DURATION_MINUTES;

    const schedule = await this.repository.findScheduleByDentist(query.dentistId);
    const dayOfWeek = date.getUTCDay();
    const workingBlocks = schedule?.blocks.filter((b) => b.dayOfWeek === dayOfWeek) ?? [];
    if (workingBlocks.length === 0) {
      return { slots: [] };
    }

    const exceptions = await this.repository.findExceptionsForDate(query.dentistId, date);
    const isAllDayBlocked = exceptions.some((e) => e.allDay);
    const partialBlockedRanges = exceptions
      .filter((e) => !e.allDay && e.startTime && e.endTime)
      .map((e) => ({ startTime: e.startTime!, endTime: e.endTime! }));

    // Límites del día en hora de la clínica (no medianoche UTC) — para que
    // las citas ya agendadas se excluyan correctamente de los slots libres.
    const dayStartUtc = zonedTimeToUtc(date, '00:00');
    const nextDayMarker = new Date(date);
    nextDayMarker.setUTCDate(nextDayMarker.getUTCDate() + 1);
    const dayEndUtc = zonedTimeToUtc(nextDayMarker, '00:00');
    const busyRanges = await this.repository.findBusyRanges(
      query.dentistId,
      dayStartUtc,
      dayEndUtc,
    );

    const slots = this.slotCalculator.computeFreeSlots({
      date,
      workingBlocks,
      isAllDayBlocked,
      partialBlockedRanges,
      busyRanges,
      durationMinutes,
    });

    return { slots: slots.map((slot) => slot.toISOString()) };
  }
}
