// Cloudinary exige el mismo resourceType usado al subir para poder borrar el
// archivo después (uploader.destroy requiere el resource_type correcto) —
// por eso se persiste junto al resto de la metadata, no se recalcula.
export type ClinicalRecordAttachmentResourceType = 'image' | 'raw';

export class ClinicalRecordAttachment {
  constructor(
    public readonly _id: unknown,
    public url: string,
    public publicId: string,
    public resourceType: ClinicalRecordAttachmentResourceType,
    public fileName: string,
    public mimeType: string,
    public sizeBytes: number,
    public uploadedBy: unknown,
    public uploadedAt: Date,
    public treatmentIndex?: number,
  ) {}
}
