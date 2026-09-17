import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { ToothStatus } from '../../../domain/entities/tooth-state.entity';

@Schema({ _id: false })
export class Tooth {
  @Prop({ required: true })
  toothNumber: string;

  @Prop({
    required: true,
    enum: Object.values(ToothStatus),
    default: ToothStatus.SANO,
  })
  status: string;

  @Prop({ required: false })
  observations?: string;

  @Prop({ required: false })
  updatedAt?: Date;
}

export const ToothSchema = SchemaFactory.createForClass(Tooth);

export type OdontogramDocument = Odontogram & Document;

@Schema({ timestamps: true })
export class Odontogram {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true, unique: true })
  patient: string;

  @Prop({ type: [ToothSchema], required: true })
  teeth: Tooth[];

  @Prop({ required: false })
  generalObservations?: string;
}

export const OdontogramSchema = SchemaFactory.createForClass(Odontogram);
