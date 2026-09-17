import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { AppointmentStatus } from '../../../domain/entities/appointment-status.enum';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true })
  patient: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  dentist: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ required: true, default: 60 })
  durationMinutes: number;

  @Prop({
    required: true,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDIENTE,
  })
  status: string;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: false })
  observations?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ClinicalRecord', required: false })
  clinicalRecord?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
