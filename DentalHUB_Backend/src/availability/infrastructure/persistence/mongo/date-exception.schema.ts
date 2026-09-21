import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type DateExceptionDocument = DateException & Document;

@Schema({ timestamps: true })
export class DateException {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  dentist: string;

  // Día completo, almacenado a medianoche UTC (ver nota de zona horaria en
  // verify-dentist-availability.use-case.ts).
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, default: false })
  allDay: boolean;

  @Prop({ required: false })
  startTime?: string;

  @Prop({ required: false })
  endTime?: string;

  @Prop({ required: false })
  reason?: string;
}

export const DateExceptionSchema = SchemaFactory.createForClass(DateException);
DateExceptionSchema.index({ dentist: 1, date: 1 });
