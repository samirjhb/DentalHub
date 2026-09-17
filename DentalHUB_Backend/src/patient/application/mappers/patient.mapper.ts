import { Patient } from '../../domain/entities/patient.entity';
import { PatientDocument } from '../../infrastructure/persistence/mongo/patient.schema';

export class PatientMapper {
  static toDomain(doc: PatientDocument): Patient {
    return new Patient(
      doc._id,
      doc.name,
      doc.rut,
      doc.cel,
      doc.email,
      doc.record,
      doc.birthDate,
      doc.evaluations,
      doc.clinicalRecords,
      // @Schema({timestamps:true}) inyecta createdAt/updatedAt en runtime, pero la
      // clase Patient (Mongoose) nunca los declaró como @Prop — el cast documenta
      // ese hueco preexistente entre tipos y runtime, no lo introduce.
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  // No incluye `__v` a propósito: es interno de Mongoose y la auditoría del
  // frontend confirmó que nunca se lee. Todo lo demás se preserva igual que hoy.
  static toResponse(entity: Patient) {
    return {
      _id: entity._id,
      name: entity.name,
      rut: entity.rut,
      cel: entity.cel,
      email: entity.email,
      record: entity.record,
      birthDate: entity.birthDate,
      evaluations: entity.evaluations,
      clinicalRecords: entity.clinicalRecords,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
