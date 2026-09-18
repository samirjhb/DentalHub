import { Prescription } from '../../domain/entities/prescription.entity';
import { PrescriptionDocument } from '../../infrastructure/persistence/mongo/prescription.schema';

export class PrescriptionMapper {
  static toDomain(doc: PrescriptionDocument): Prescription {
    return new Prescription(
      doc._id,
      doc.patient,
      doc.dentist,
      doc.medications,
      doc.issuedAt,
      doc.clinicalRecord,
      doc.observations,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  static toResponse(entity: Prescription) {
    return {
      _id: entity._id,
      patient: entity.patient,
      dentist: entity.dentist,
      medications: entity.medications,
      issuedAt: entity.issuedAt,
      clinicalRecord: entity.clinicalRecord,
      observations: entity.observations,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
