import { WeeklySchedule } from '../entities/weekly-schedule.entity';
import { DateException } from '../entities/date-exception.entity';
import { ScheduleBlock } from '../entities/schedule-block';

export interface BusyRange {
  startAt: Date;
  endAt: Date;
}

export abstract class AvailabilityRepository {
  // Igual que AppointmentRepository.verifyDentistExists — respaldado por un
  // registro independiente de 'Auth', no por AuthModule.
  abstract verifyDentistExists(dentistId: string): Promise<boolean>;

  abstract findScheduleByDentist(
    dentistId: string,
  ): Promise<WeeklySchedule | null>;
  abstract upsertSchedule(
    dentistId: string,
    blocks: ScheduleBlock[],
  ): Promise<WeeklySchedule>;

  abstract findExceptionsByDentist(dentistId: string): Promise<DateException[]>;
  abstract findExceptionsForDate(
    dentistId: string,
    date: Date,
  ): Promise<DateException[]>;
  abstract createException(
    dentistId: string,
    exception: {
      date: Date;
      allDay: boolean;
      startTime?: string;
      endTime?: string;
      reason?: string;
    },
  ): Promise<DateException>;
  abstract deleteException(
    dentistId: string,
    exceptionId: string,
  ): Promise<boolean>;

  // Citas ya agendadas (no CANCELADA) para ese odontólogo dentro de un rango
  // de un día — respaldado por un registro independiente de 'Appointment'
  // (mismo criterio que appointment.module.ts usa para 'Patient'/'Auth'),
  // para no importar AppointmentModule y evitar una dependencia circular.
  abstract findBusyRanges(
    dentistId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<BusyRange[]>;
}
