import { ClinicalRecord } from '../../domain/entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../../domain/entities/clinical-record-treatment.entity';
import {
  ClinicalRecordAttachment,
  ClinicalRecordAttachmentResourceType,
} from '../../domain/entities/clinical-record-attachment.entity';
import {
  Attachment,
  ClinicalRecordDocument,
  DentalTreatment,
} from '../../infrastructure/persistence/mongo/clinical-record.schema';

// Mongoose agrega `_id`/`uploadedAt` en runtime a cada subdocumento del array
// `attachments` (vía `@Schema({ timestamps: { createdAt: 'uploadedAt' } })`),
// pero la clase `Attachment` no los declara — mismo criterio que el resto del
// mapper usa para createdAt/updatedAt del documento raíz.
type AttachmentSubdocument = Attachment & { _id: unknown; uploadedAt: Date };

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
            t.deposit,
            t.appointmentDate,
            t.observations,
          ),
      ),
      doc.dentist,
      (doc.attachments ?? []).map((a) => {
        const attachment = a as AttachmentSubdocument;
        return new ClinicalRecordAttachment(
          attachment._id,
          attachment.url,
          attachment.publicId,
          attachment.resourceType as ClinicalRecordAttachmentResourceType,
          attachment.fileName,
          attachment.mimeType,
          attachment.sizeBytes,
          attachment.uploadedBy,
          attachment.uploadedAt,
          attachment.treatmentIndex,
        );
      }),
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
        toothNumber: t.toothNumber,
        treatment: t.treatment,
        price: t.price,
        status: t.status,
        deposit: t.deposit,
        appointmentDate: t.appointmentDate,
        observations: t.observations,
      })),
      attachments: entity.attachments?.map((a) => ({
        _id: a._id,
        url: a.url,
        fileName: a.fileName,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        treatmentIndex: a.treatmentIndex,
        uploadedBy: a.uploadedBy,
        uploadedAt: a.uploadedAt,
      })),
      dentist: entity.dentist,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      __v: entity.__v,
    };
  }
}
