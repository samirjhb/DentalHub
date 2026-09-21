import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type WeeklyScheduleDocument = WeeklySchedule & Document;

@Schema({ _id: false })
export class ScheduleBlockSubdocument {
  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}

const ScheduleBlockSchema = SchemaFactory.createForClass(ScheduleBlockSubdocument);

@Schema({ timestamps: true })
export class WeeklySchedule {
  // Un doc por odontólogo (índice único) — PUT reemplaza el array completo.
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true, unique: true })
  dentist: string;

  @Prop({ type: [ScheduleBlockSchema], default: [] })
  blocks: ScheduleBlockSubdocument[];
}

export const WeeklyScheduleSchema = SchemaFactory.createForClass(WeeklySchedule);
