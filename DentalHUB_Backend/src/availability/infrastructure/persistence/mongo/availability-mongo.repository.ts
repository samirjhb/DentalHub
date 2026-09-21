import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AvailabilityRepository,
  BusyRange,
} from '../../../domain/repositories/availability.repository';
import { WeeklySchedule as WeeklyScheduleEntity } from '../../../domain/entities/weekly-schedule.entity';
import { DateException as DateExceptionEntity } from '../../../domain/entities/date-exception.entity';
import { ScheduleBlock } from '../../../domain/entities/schedule-block';
import {
  WeeklySchedule,
  WeeklyScheduleDocument,
} from './weekly-schedule.schema';
import { DateException, DateExceptionDocument } from './date-exception.schema';
import { AuthDocument } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { Role } from 'src/shared/enums/role.enum';
import { AppointmentDocument } from 'src/appointment/infrastructure/persistence/mongo/appointment.schema';
import { AppointmentStatus } from 'src/appointment/domain/entities/appointment-status.enum';

@Injectable()
export class AvailabilityMongoRepository extends AvailabilityRepository {
  constructor(
    @InjectModel(WeeklySchedule.name)
    private readonly weeklyScheduleModel: Model<WeeklyScheduleDocument>,
    @InjectModel(DateException.name)
    private readonly dateExceptionModel: Model<DateExceptionDocument>,
    @InjectModel('Auth')
    private readonly authModel: Model<AuthDocument>,
    // Registrado de forma independiente bajo el token literal 'Appointment'
    // (mismo criterio que appointment.module.ts usa para 'Patient'/'Auth')
    // para no importar AppointmentModule y evitar una dependencia circular
    // con VerifyDentistAvailabilityUseCase.
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {
    super();
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    const dentist = await this.authModel.findOne({
      _id: dentistId,
      role: Role.DENTIST,
    });
    return !!dentist;
  }

  async findScheduleByDentist(
    dentistId: string,
  ): Promise<WeeklyScheduleEntity | null> {
    const doc = await this.weeklyScheduleModel.findOne({ dentist: dentistId });
    return doc ? this.scheduleToDomain(doc) : null;
  }

  async upsertSchedule(
    dentistId: string,
    blocks: ScheduleBlock[],
  ): Promise<WeeklyScheduleEntity> {
    const doc = await this.weeklyScheduleModel.findOneAndUpdate(
      { dentist: dentistId },
      { dentist: dentistId, blocks },
      { new: true, upsert: true },
    );
    return this.scheduleToDomain(doc!);
  }

  async findExceptionsByDentist(dentistId: string): Promise<DateExceptionEntity[]> {
    const docs = await this.dateExceptionModel
      .find({ dentist: dentistId })
      .sort({ date: 1 });
    return docs.map((doc) => this.exceptionToDomain(doc));
  }

  async findExceptionsForDate(
    dentistId: string,
    date: Date,
  ): Promise<DateExceptionEntity[]> {
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const docs = await this.dateExceptionModel.find({
      dentist: dentistId,
      date: { $gte: dayStart, $lte: dayEnd },
    });
    return docs.map((doc) => this.exceptionToDomain(doc));
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
  ): Promise<DateExceptionEntity> {
    const created = await this.dateExceptionModel.create({
      dentist: dentistId,
      ...exception,
    });
    return this.exceptionToDomain(created);
  }

  async deleteException(dentistId: string, exceptionId: string): Promise<boolean> {
    const result = await this.dateExceptionModel.deleteOne({
      _id: exceptionId,
      dentist: dentistId,
    });
    return result.deletedCount > 0;
  }

  async findBusyRanges(
    dentistId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<BusyRange[]> {
    const docs = await this.appointmentModel.find({
      dentist: dentistId,
      status: { $ne: AppointmentStatus.CANCELADA },
      startAt: { $lt: dayEnd },
      endAt: { $gt: dayStart },
    });
    return docs.map((doc) => ({ startAt: doc.startAt, endAt: doc.endAt }));
  }

  private scheduleToDomain(doc: WeeklyScheduleDocument): WeeklyScheduleEntity {
    return new WeeklyScheduleEntity(
      doc._id,
      doc.dentist,
      doc.blocks.map((b) => ({
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  private exceptionToDomain(doc: DateExceptionDocument): DateExceptionEntity {
    return new DateExceptionEntity(
      doc._id,
      doc.dentist,
      doc.date,
      doc.allDay,
      doc.startTime,
      doc.endTime,
      doc.reason,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }
}
