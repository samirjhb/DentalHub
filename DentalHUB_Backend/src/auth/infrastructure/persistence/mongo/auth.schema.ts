import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../../shared/enums/role.enum';

export type AuthDocument = Auth & Document;

@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop({ type: String, enum: Role, default: Role.PATIENT })
  role: Role;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
