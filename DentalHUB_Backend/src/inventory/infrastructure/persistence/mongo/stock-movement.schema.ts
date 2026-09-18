import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { StockMovementType } from '../../../domain/entities/stock-movement-type.enum';

export type StockMovementDocument = StockMovement & Document;

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'InventoryItem', required: true })
  item: string;

  @Prop({
    required: true,
    enum: Object.values(StockMovementType),
  })
  type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Auth', required: true })
  registeredBy: string;

  @Prop({ required: true, default: Date.now })
  movementDate: Date;

  @Prop({ required: false })
  reason?: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
