import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({ required: true, default: 0 })
  minStock: number;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
