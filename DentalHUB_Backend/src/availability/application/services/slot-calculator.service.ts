import { Injectable } from '@nestjs/common';
import { ScheduleBlock } from '../../domain/entities/schedule-block';
import { BusyRange } from '../../domain/repositories/availability.repository';
import { zonedTimeToUtc } from '../../../shared/utils/clinic-timezone.util';

export interface PartialBlockedRange {
  startTime: string;
  endTime: string;
}

export interface ComputeFreeSlotsParams {
  // Marcador de día puro (año/mes/día, tomados vía getters UTC) del día
  // consultado — los bloques/excepciones "HH:mm" se anclan a este día e
  // interpretan como hora de la clínica (ver clinic-timezone.util.ts).
  date: Date;
  workingBlocks: ScheduleBlock[]; // ya filtrados para el day-of-week de `date`
  isAllDayBlocked: boolean;
  partialBlockedRanges: PartialBlockedRange[];
  busyRanges: BusyRange[];
  durationMinutes: number;
}

@Injectable()
export class SlotCalculatorService {
  static readonly SLOT_GRANULARITY_MINUTES = 30;

  computeFreeSlots(params: ComputeFreeSlotsParams): Date[] {
    if (params.isAllDayBlocked || params.workingBlocks.length === 0) {
      return [];
    }

    const durationMs = params.durationMinutes * 60_000;
    const granularityMs = SlotCalculatorService.SLOT_GRANULARITY_MINUTES * 60_000;
    const slots: Date[] = [];

    for (const block of params.workingBlocks) {
      const blockStart = this.toDateTime(params.date, block.startTime);
      const blockEnd = this.toDateTime(params.date, block.endTime);

      for (
        let tickStart = blockStart.getTime();
        tickStart + durationMs <= blockEnd.getTime();
        tickStart += granularityMs
      ) {
        const tickEnd = tickStart + durationMs;
        const blockedByException = params.partialBlockedRanges.some((range) => {
          const rangeStart = this.toDateTime(params.date, range.startTime).getTime();
          const rangeEnd = this.toDateTime(params.date, range.endTime).getTime();
          return tickStart < rangeEnd && tickEnd > rangeStart;
        });
        const blockedByAppointment = params.busyRanges.some(
          (busy) => tickStart < busy.endAt.getTime() && tickEnd > busy.startAt.getTime(),
        );

        if (!blockedByException && !blockedByAppointment) {
          slots.push(new Date(tickStart));
        }
      }
    }

    return slots.sort((a, b) => a.getTime() - b.getTime());
  }

  // Ancla una hora de reloj "HH:mm" al día dado, interpretada como hora de
  // la clínica (America/Santiago) — ver clinic-timezone.util.ts.
  toDateTime(date: Date, hhmm: string): Date {
    return zonedTimeToUtc(date, hhmm);
  }
}
