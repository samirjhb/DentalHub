import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuthRepository,
  CreateAuthData,
} from '../../../domain/repositories/auth.repository';
import { Auth as AuthEntity } from '../../../domain/entities/auth.entity';
import { Auth, AuthDocument } from './auth.schema';
import { AuthMapper } from '../../../application/mappers/auth.mapper';
import { Role } from '../../../../shared/enums/role.enum';

@Injectable()
export class AuthMongoRepository extends AuthRepository {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: Model<AuthDocument>,
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
}
