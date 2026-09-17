import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AppointmentRepository,
  CreateAppointmentData,
  FindAllAppointmentsFilter,
} from '../../../domain/repositories/appointment.repository';
import { Appointment as AppointmentEntity } from '../../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../domain/entities/appointment-status.enum';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { AuthDocument } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { Role } from 'src/shared/enums/role.enum';
import { AppointmentMapper } from '../../../application/mappers/appointment.mapper';

@Injectable()
export class AppointmentMongoRepository extends AppointmentRepository {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel('Auth')
    private readonly authModel: Model<AuthDocument>,
  ) {
    super();
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    const patient = await this.patientModel.findById(patientId);
    return !!patient;
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    const dentist = await this.authModel.findOne({
      _id: dentistId,
      role: Role.DENTIST,
    });
    return !!dentist;
  }

  async findOverlapping(
    dentistId: string,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const query: Record<string, unknown> = {
      dentist: dentistId,
      status: { $ne: AppointmentStatus.CANCELADA },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    };
    if (excludeAppointmentId) {
      query._id = { $ne: excludeAppointmentId };
    }
    const overlapping = await this.appointmentModel.findOne(query);
    return !!overlapping;
  }

  async create(data: CreateAppointmentData): Promise<AppointmentEntity> {
    const created = await this.appointmentModel.create({
      ...data,
      status: AppointmentStatus.PENDIENTE,
    });
    return AppointmentMapper.toDomain(created);
  }

  async findAll(
    filter: FindAllAppointmentsFilter,
  ): Promise<AppointmentEntity[]> {
    const query: Record<string, unknown> = {};
    if (filter.dentist) query.dentist = filter.dentist;
    if (filter.patient) query.patient = filter.patient;
    if (filter.status) query.status = filter.status;
    if (filter.startDate || filter.endDate) {
      query.startAt = {
        ...(filter.startDate ? { $gte: filter.startDate } : {}),
        ...(filter.endDate ? { $lte: filter.endDate } : {}),
      };
    }
    const docs = await this.appointmentModel.find(query);
    return docs.map((doc) => AppointmentMapper.toDomain(doc));
  }

  async findById(id: string): Promise<AppointmentEntity | null> {
    const doc = await this.appointmentModel.findById(id);
    return doc ? AppointmentMapper.toDomain(doc) : null;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<AppointmentEntity | null> {
    const doc = await this.appointmentModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    return doc ? AppointmentMapper.toDomain(doc) : null;
  }

  async reschedule(
    id: string,
    startAt: Date,
    endAt: Date,
    durationMinutes: number,
  ): Promise<AppointmentEntity | null> {
    const doc = await this.appointmentModel.findByIdAndUpdate(
      id,
      { startAt, endAt, durationMinutes },
      { new: true },
    );
    return doc ? AppointmentMapper.toDomain(doc) : null;
  }
}
