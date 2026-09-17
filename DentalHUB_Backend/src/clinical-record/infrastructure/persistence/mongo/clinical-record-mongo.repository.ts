import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClinicalRecordRepository } from '../../../domain/repositories/clinical-record.repository';
import { ClinicalRecord as ClinicalRecordEntity } from '../../../domain/entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../../../domain/entities/clinical-record-treatment.entity';
import { ClinicalRecord, ClinicalRecordDocument } from './clinical-record.schema';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { CreateClinicalRecordDto } from '../../../application/dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../../../application/dto/update-clinical-record.dto';
import { FilterClinicalRecordDto } from '../../../application/dto/filter-clinical-record.dto';
import { ClinicalRecordMapper } from '../../../application/mappers/clinical-record.mapper';

@Injectable()
export class ClinicalRecordMongoRepository extends ClinicalRecordRepository {
  constructor(
    @InjectModel(ClinicalRecord.name)
    private readonly clinicalRecordModel: Model<ClinicalRecordDocument>,
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
  ) {
    super();
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    const patient = await this.patientModel.findById(patientId);
    return !!patient;
  }

  async create(dto: CreateClinicalRecordDto): Promise<ClinicalRecordEntity> {
    const created = new this.clinicalRecordModel(dto);
    const saved = await created.save();
    return ClinicalRecordMapper.toDomain(saved);
  }

  async findAll(): Promise<ClinicalRecordEntity[]> {
    const docs = await this.clinicalRecordModel
      .find()
      .populate('patient')
      .exec();
    return docs.map((doc) => ClinicalRecordMapper.toDomain(doc));
  }

  async findWithFilters(
    filterDto: FilterClinicalRecordDto,
  ): Promise<ClinicalRecordEntity[]> {
    const { patientId, status, startDate, endDate, dentist } = filterDto;
    const query: any = {};

    if (patientId) {
      query.patient = patientId;
    }

    if (dentist) {
      query.dentist = { $regex: dentist, $options: 'i' };
    }

    if (status) {
      query.treatments = {
        $elemMatch: { status: status },
      };
    }

    if (startDate || endDate) {
      query.treatments = {
        $elemMatch: {},
      };

      if (startDate) {
        query.treatments.$elemMatch.appointmentDate = { $gte: startDate };
      }

      if (endDate) {
        query.treatments.$elemMatch.appointmentDate = {
          ...query.treatments.$elemMatch.appointmentDate,
          $lte: endDate,
        };
      }
    }

    const docs = await this.clinicalRecordModel
      .find(query)
      .populate('patient')
      .exec();
    return docs.map((doc) => ClinicalRecordMapper.toDomain(doc));
  }

  async findByPatient(patientId: string): Promise<ClinicalRecordEntity[]> {
    const docs = await this.clinicalRecordModel
      .find({ patient: patientId })
      .exec();
    return docs.map((doc) => ClinicalRecordMapper.toDomain(doc));
  }

  async findById(id: string): Promise<ClinicalRecordEntity | null> {
    const doc = await this.clinicalRecordModel.findById(id).exec();
    return doc ? ClinicalRecordMapper.toDomain(doc) : null;
  }

  async findByIdWithPatient(id: string): Promise<ClinicalRecordEntity | null> {
    const doc = await this.clinicalRecordModel
      .findById(id)
      .populate('patient')
      .exec();
    return doc ? ClinicalRecordMapper.toDomain(doc) : null;
  }

  async update(
    id: string,
    dto: UpdateClinicalRecordDto,
  ): Promise<ClinicalRecordEntity | null> {
    const doc = await this.clinicalRecordModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    return doc ? ClinicalRecordMapper.toDomain(doc) : null;
  }

  async updateTreatments(
    id: string,
    treatments: ClinicalRecordTreatment[],
  ): Promise<ClinicalRecordEntity | null> {
    const doc = await this.clinicalRecordModel
      .findByIdAndUpdate(id, { treatments }, { new: true })
      .exec();
    return doc ? ClinicalRecordMapper.toDomain(doc) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.clinicalRecordModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
