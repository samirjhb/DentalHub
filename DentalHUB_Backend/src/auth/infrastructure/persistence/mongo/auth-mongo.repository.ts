import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthRepository,
  CreateAuthData,
  UpdateAuthData,
} from '../../../domain/repositories/auth.repository';
import { Auth as AuthEntity } from '../../../domain/entities/auth.entity';
import { Auth, AuthDocument } from './auth.schema';
import { AuthMapper } from '../../../application/mappers/auth.mapper';
import { Role } from '../../../../shared/enums/role.enum';
import { PatientDocument } from '../../../../patient/infrastructure/persistence/mongo/patient.schema';

@Injectable()
export class AuthMongoRepository extends AuthRepository {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
    // Registro independiente de 'Patient' bajo el mismo token literal que ya
    // usan appointment/billing/clinical-record — evita acoplarse al PatientRepository.
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<AuthEntity | null> {
    const doc = await this.authModel.findOne({ email });
    return doc ? AuthMapper.toDomain(doc) : null;
  }

  async findById(id: string): Promise<AuthEntity | null> {
    const doc = await this.authModel.findById(id);
    return doc ? AuthMapper.toDomain(doc) : null;
  }

  async countByRole(role: Role): Promise<number> {
    return this.authModel.countDocuments({ role });
  }

  async create(data: CreateAuthData): Promise<AuthEntity> {
    const doc = await this.authModel.create(data);
    return AuthMapper.toDomain(doc);
  }

  async findByRole(role?: Role): Promise<AuthEntity[]> {
    const docs = await this.authModel.find(role ? { role } : {});
    return docs.map((doc) => AuthMapper.toDomain(doc));
  }

  async update(id: string, data: UpdateAuthData): Promise<AuthEntity | null> {
    const doc = await this.authModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? AuthMapper.toDomain(doc) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.authModel.findByIdAndUpdate(id, { password: hashedPassword });
  }

  async findByPatientId(patientId: string): Promise<AuthEntity | null> {
    const doc = await this.authModel.findOne({ patientId });
    return doc ? AuthMapper.toDomain(doc) : null;
  }

  async linkPatient(authId: string, patientId: string): Promise<AuthEntity | null> {
    const doc = await this.authModel.findByIdAndUpdate(
      authId,
      { patientId },
      { new: true },
    );
    return doc ? AuthMapper.toDomain(doc) : null;
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    const patient = await this.patientModel.findById(patientId);
    return !!patient;
  }
}
