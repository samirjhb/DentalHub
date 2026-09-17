import { ClinicalRecord } from '../../domain/entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../../domain/entities/clinical-record-treatment.entity';
import {
  ClinicalRecordDocument,
  DentalTreatment,
} from '../../infrastructure/persistence/mongo/clinical-record.schema';

export class ClinicalRecordMapper {
  static toDomain(doc: ClinicalRecordDocument): ClinicalRecord {
    return new ClinicalRecord(
      doc._id,
      doc.patient,
      (doc.treatments ?? []).map(
        (t: DentalTreatment) =>
          new ClinicalRecordTreatment(
            t.diagnosis,
            t.toothNumber,
            t.treatment,
            t.price,
            t.status,
            t.radiography,
            t.deposit,
            t.appointmentDate,
            t.observations,
          ),
      ),
      doc.dentist,
      doc.attachments,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
      (doc as unknown as { __v?: number }).__v,
    );
  }

  // A diferencia de patient.mapper.ts, acá SÍ se incluye __v: no existe una
  // auditoría del frontend que confirme que nunca se lee para este módulo, así
  // que se preserva para no cambiar el shape de respuesta actual.
  static toResponse(entity: ClinicalRecord) {
    return {
      _id: entity._id,
      patient: entity.patient,
      treatments: entity.treatments.map((t) => ({
        diagnosis: t.diagnosis,
        radiography: t.radiography,
        toothNumber: t.toothNumber,
        treatment: t.treatment,
        price: t.price,
        status: t.status,
        deposit: t.deposit,
        appointmentDate: t.appointmentDate,
        observations: t.observations,
      })),
      attachments: entity.attachments,
      dentist: entity.dentist,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      __v: entity.__v,
    };
  }
}
