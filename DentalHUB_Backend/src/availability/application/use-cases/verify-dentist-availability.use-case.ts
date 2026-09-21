import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { SlotCalculatorService } from '../services/slot-calculator.service';
import { getZonedDateParts } from '../../../shared/utils/clinic-timezone.util';

@Injectable()
export class VerifyDentistAvailabilityUseCase {
  constructor(
    private readonly repository: AvailabilityRepository,
    private readonly slotCalculator: SlotCalculatorService,
  ) {}

  async execute(dentistId: string, startAt: Date, endAt: Date): Promise<boolean> {
    const schedule = await this.repository.findScheduleByDentist(dentistId);
    if (!schedule || schedule.blocks.length === 0) {
      // Sin horario configurado todavía => permisivo, no bloquea a los
      // odontólogos existentes que no han migrado a esta feature nueva.
      return true;
    }

    // El día calendario y el día de la semana se resuelven en la zona de la
    // clínica (America/Santiago), no en UTC — un instante cerca de la
    // medianoche puede caer en un día distinto según la zona.
    const { year, month, day, dayOfWeek } = getZonedDateParts(startAt);
    const dayMarker = new Date(Date.UTC(year, month - 1, day));

    const dayBlocks = schedule.blocks.filter((b) => b.dayOfWeek === dayOfWeek);
    const fitsInsideAWorkingBlock = dayBlocks.some((block) => {
      const blockStart = this.slotCalculator.toDateTime(dayMarker, block.startTime);
      const blockEnd = this.slotCalculator.toDateTime(dayMarker, block.endTime);
      return startAt >= blockStart && endAt <= blockEnd;
    });
    if (!fitsInsideAWorkingBlock) {
      return false;
    }

    const exceptions = await this.repository.findExceptionsForDate(dentistId, dayMarker);

    const isBlockedByException = exceptions.some((exception) => {
      if (exception.allDay) return true;
      if (!exception.startTime || !exception.endTime) return false;
      const exceptionStart = this.slotCalculator.toDateTime(dayMarker, exception.startTime);
      const exceptionEnd = this.slotCalculator.toDateTime(dayMarker, exception.endTime);
      return startAt < exceptionEnd && endAt > exceptionStart;
    });

    return !isBlockedByException;
  }
}
