import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OdontogramRepository } from '../../../domain/repositories/odontogram.repository';
import { Odontogram as OdontogramEntity } from '../../../domain/entities/odontogram.entity';
import { ToothState, ToothStatus } from '../../../domain/entities/tooth-state.entity';
import { Odontogram, OdontogramDocument } from './odontogram.schema';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { OdontogramMapper } from '../../../application/mappers/odontogram.mapper';

@Injectable()
export class OdontogramMongoRepository extends OdontogramRepository {
  constructor(
    @InjectModel(Odontogram.name)
    private readonly odontogramModel: Model<OdontogramDocument>,
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    const patient = await this.patientModel.findById(patientId);
    return !!patient;
  }

  async findByPatientId(patientId: string): Promise<OdontogramEntity | null> {
    const doc = await this.odontogramModel.findOne({ patient: patientId });
    return doc ? OdontogramMapper.toDomain(doc) : null;
  }

  async create(
    patientId: string,
    teeth: ToothState[],
  ): Promise<OdontogramEntity> {
    const created = await this.odontogramModel.create({
      patient: patientId,
      teeth: teeth.map((t) => ({
        toothNumber: t.toothNumber,
        status: t.status,
        observations: t.observations,
      })),
    });
    return OdontogramMapper.toDomain(created);
  }

  async updateTooth(
    patientId: string,
    toothNumber: string,
    status: ToothStatus,
    observations?: string,
  ): Promise<OdontogramEntity | null> {
    const doc = await this.odontogramModel.findOneAndUpdate(
      { patient: patientId, 'teeth.toothNumber': toothNumber },
      {
        $set: {
          'teeth.$.status': status,
          'teeth.$.observations': observations,
          'teeth.$.updatedAt': new Date(),
        },
      },
      { new: true },
    );
    return doc ? OdontogramMapper.toDomain(doc) : null;
  }

  async updateGeneralObservations(
    patientId: string,
    observations: string,
  ): Promise<OdontogramEntity | null> {
    const doc = await this.odontogramModel.findOneAndUpdate(
      { patient: patientId },
      { generalObservations: observations },
      { new: true },
    );
    return doc ? OdontogramMapper.toDomain(doc) : null;
  }
}
