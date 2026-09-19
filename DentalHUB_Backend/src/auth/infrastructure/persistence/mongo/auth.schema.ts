import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
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

  // Vínculo opcional hacia el registro de dominio del paciente (módulo `patient`).
  // Único-sparse: un mismo Patient no puede quedar vinculado a dos cuentas Auth.
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: false })
  patientId?: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
AuthSchema.index({ patientId: 1 }, { unique: true, sparse: true });
