import {
  AvailabilityRepository,
  BusyRange,
} from '../../domain/repositories/availability.repository';
import { WeeklySchedule } from '../../domain/entities/weekly-schedule.entity';
import { DateException } from '../../domain/entities/date-exception.entity';
import { ScheduleBlock } from '../../domain/entities/schedule-block';

export class InMemoryAvailabilityRepository extends AvailabilityRepository {
  private schedules = new Map<string, WeeklySchedule>();
  private exceptions: DateException[] = [];
  private busyRanges = new Map<string, BusyRange[]>();
  private existingDentistIds = new Set<string>();
  private nextExceptionId = 1;

  // Helpers de test, no forman parte del puerto real.
  seedDentist(dentistId: string): void {
    this.existingDentistIds.add(dentistId);
  }

  seedSchedule(dentistId: string, blocks: ScheduleBlock[]): void {
    this.schedules.set(
      dentistId,
      new WeeklySchedule(dentistId, dentistId, blocks, new Date(), new Date()),
    );
  }

  seedBusyRanges(dentistId: string, ranges: BusyRange[]): void {
    this.busyRanges.set(dentistId, ranges);
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    return this.existingDentistIds.has(dentistId);
  }

  async findScheduleByDentist(dentistId: string): Promise<WeeklySchedule | null> {
    return this.schedules.get(dentistId) ?? null;
  }

  async upsertSchedule(
    dentistId: string,
    blocks: ScheduleBlock[],
  ): Promise<WeeklySchedule> {
    const schedule = new WeeklySchedule(dentistId, dentistId, blocks, new Date(), new Date());
    this.schedules.set(dentistId, schedule);
    return schedule;
  }

  async findExceptionsByDentist(dentistId: string): Promise<DateException[]> {
    return this.exceptions.filter((e) => e.dentist === dentistId);
  }

  async findExceptionsForDate(dentistId: string, date: Date): Promise<DateException[]> {
    return this.exceptions.filter(
      (e) => e.dentist === dentistId && e.date.getTime() === date.getTime(),
    );
  }

  async createException(
    dentistId: string,
    exception: {
      date: Date;
      allDay: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    },
  ): Promise<DateException> {
    const created = new DateException(
      String(this.nextExceptionId++),
      dentistId,
      exception.date,
      exception.allDay,
      exception.startTime,
      exception.endTime,
      exception.reason,
      new Date(),
      new Date(),
    );
    this.exceptions.push(created);
    return created;
  }

  async deleteException(dentistId: string, exceptionId: string): Promise<boolean> {
    const before = this.exceptions.length;
    this.exceptions = this.exceptions.filter(
      (e) => !(e.dentist === dentistId && String(e._id) === exceptionId),
    );
    return this.exceptions.length < before;
  }

  async findBusyRanges(dentistId: string): Promise<BusyRange[]> {
    return this.busyRanges.get(dentistId) ?? [];
  }
}
