import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

@Schema({ _id: false })
export class Medication {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  dosage: string;

  @Prop({ required: true })
  frequency: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: false })
  instructions?: string;
}

export const MedicationSchema = SchemaFactory.createForClass(Medication);

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true })
  patient: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  dentist: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ClinicalRecord', required: false })
  clinicalRecord?: string;

  @Prop({ type: [MedicationSchema], required: true })
  medications: Medication[];

  @Prop({ required: true, default: Date.now })
  issuedAt: Date;

  @Prop({ required: false })
  observations?: string;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
