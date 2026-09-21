import { WeeklySchedule } from '../../domain/entities/weekly-schedule.entity';
import { DateException } from '../../domain/entities/date-exception.entity';

export class AvailabilityMapper {
  static scheduleToResponse(entity: WeeklySchedule) {
    return {
      _id: entity._id,
      dentist: entity.dentist,
      blocks: entity.blocks,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static exceptionToResponse(entity: DateException) {
    return {
      _id: entity._id,
      dentist: entity.dentist,
      date: entity.date,
      allDay: entity.allDay,
      startTime: entity.startTime,
      endTime: entity.endTime,
      reason: entity.reason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
