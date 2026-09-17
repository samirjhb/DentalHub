import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../domain/entities/appointment-status.enum';
import { AppointmentDocument } from '../../infrastructure/persistence/mongo/appointment.schema';

export class AppointmentMapper {
  static toDomain(doc: AppointmentDocument): Appointment {
    return new Appointment(
      doc._id,
      doc.patient,
      doc.dentist,
      doc.startAt,
      doc.endAt,
      doc.durationMinutes,
      doc.status as AppointmentStatus,
      doc.reason,
      doc.observations,
      doc.clinicalRecord,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  static toResponse(entity: Appointment) {
    return {
      _id: entity._id,
      patient: entity.patient,
      dentist: entity.dentist,
      startAt: entity.startAt,
      endAt: entity.endAt,
      durationMinutes: entity.durationMinutes,
      status: entity.status,
      reason: entity.reason,
      observations: entity.observations,
      clinicalRecord: entity.clinicalRecord,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
