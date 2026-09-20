import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientRepository } from '../../../domain/repositories/patient.repository';
import { Patient as PatientEntity } from '../../../domain/entities/patient.entity';
import { Patient, PatientDocument } from './patient.schema';
import { CreatePatientDto } from '../../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../../application/dto/update-patient.dto';
import { PatientMapper } from '../../../application/mappers/patient.mapper';

@Injectable()
export class PatientMongoRepository extends PatientRepository {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  async findOneByRut(rut: string): Promise<PatientEntity | null> {
    const doc = await this.patientModel.findOne({ rut });
    return doc ? PatientMapper.toDomain(doc) : null;
  }

  async findOneByRutExcludingId(
    rut: string,
    excludeId: string,
  ): Promise<PatientEntity | null> {
    const doc = await this.patientModel.findOne({
      rut,
      _id: { $ne: excludeId },
    });
    return doc ? PatientMapper.toDomain(doc) : null;
  }

  async create(dto: CreatePatientDto): Promise<PatientEntity> {
    const created = await this.patientModel.create(dto);
    return PatientMapper.toDomain(created);
  }

  async findAllWithRelations(
    skip?: number,
    limit?: number,
  ): Promise<PatientEntity[]> {
    let query = this.patientModel
      .find()
      .populate('evaluations')
      .populate('clinicalRecords');
    if (skip !== undefined) query = query.skip(skip);
    if (limit !== undefined) query = query.limit(limit);
    const docs = await query.exec();
    return docs.map((doc) => PatientMapper.toDomain(doc));
  }

  async count(): Promise<number> {
    return this.patientModel.countDocuments();
  }

  async findById(id: string): Promise<PatientEntity | null> {
    const doc = await this.patientModel.findById(id);
    return doc ? PatientMapper.toDomain(doc) : null;
  }

  async findByIdWithRelations(id: string): Promise<PatientEntity | null> {
    const doc = await this.patientModel
      .findById(id)
      .populate('evaluations')
      .populate('clinicalRecords')
      .exec();
    return doc ? PatientMapper.toDomain(doc) : null;
  }

  async updateByIdWithRelations(
    id: string,
    dto: UpdatePatientDto,
  ): Promise<PatientEntity | null> {
    const doc = await this.patientModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('evaluations')
      .populate('clinicalRecords')
      .exec();
    return doc ? PatientMapper.toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.patientModel.findByIdAndDelete(id);
  }
}
