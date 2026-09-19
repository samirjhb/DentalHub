import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordResetTokenDocument = PasswordResetToken & Document;

@Schema({ timestamps: true })
export class PasswordResetToken {
  @Prop({ type: Types.ObjectId, ref: 'Auth', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(
  PasswordResetToken,
);

// TTL: Mongo borra el documento solo una vez que `expiresAt` queda en el pasado.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
