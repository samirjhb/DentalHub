import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';

// Definimos el esquema para los tratamientos dentales
@Schema({ _id: false }) // Importante: _id: false para subesquemas
export class DentalTreatment {
  @Prop({ required: true })
  diagnosis: string;

  @Prop({ required: true })
  toothNumber: string;

  @Prop({ required: true })
  treatment: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    required: true,
    default: 'Pendiente',
    enum: ['Pendiente', 'En proceso', 'Completado', 'Cancelado'],
  })
  status: string;

  @Prop({ required: false, default: 0 })
  deposit: number;

  @Prop({ required: false })
  appointmentDate: Date;

  @Prop({ required: false })
  observations: string;
}

// Crear el esquema para DentalTreatment
export const DentalTreatmentSchema =
  SchemaFactory.createForClass(DentalTreatment);

// Tipo para el documento de la ficha clínica
export type ClinicalRecordDocument = ClinicalRecord & Document;

// Tipo para el tratamiento dental (para uso en el servicio)
export type DentalTreatmentDocument = DentalTreatment;

// Con _id propio (a diferencia de DentalTreatment, `_id: false`) — hace falta
// para poder borrar un adjunto puntual vía $pull. `uploadedAt` se resuelve
// como timestamp de creación del subdocumento en vez de setearse a mano.
@Schema({ timestamps: { createdAt: 'uploadedAt', updatedAt: false } })
export class Attachment {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;

  // Cloudinary exige el mismo resource_type al borrar que el usado al subir.
  @Prop({ required: true, enum: ['image', 'raw'] })
  resourceType: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  uploadedBy: string;

  @Prop({ type: Number, required: false })
  treatmentIndex?: number;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema({ timestamps: true })
export class ClinicalRecord {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true })
  patient: PatientDocument;

  @Prop({ type: [DentalTreatmentSchema], required: true })
  treatments: DentalTreatment[];

  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Prop({ required: true })
  dentist: string;
}

export const ClinicalRecordSchema =
  SchemaFactory.createForClass(ClinicalRecord);
