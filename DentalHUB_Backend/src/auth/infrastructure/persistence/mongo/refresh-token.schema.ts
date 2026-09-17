import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'Auth', required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  revoked: boolean;

  @Prop()
  replacedByTokenHash?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// TTL: Mongo borra el documento solo una vez que `expiresAt` queda en el pasado.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
