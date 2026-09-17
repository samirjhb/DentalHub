import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { PaymentMethod } from '../../../domain/entities/payment-method.enum';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'ClinicalRecord', required: true })
  clinicalRecord: string;

  @Prop({ required: true })
  treatmentIndex: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true })
  patient: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: Object.values(PaymentMethod) })
  method: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  registeredBy: string;

  @Prop({ required: true, default: Date.now })
  paidAt: Date;

  @Prop({ required: false })
  observations?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
