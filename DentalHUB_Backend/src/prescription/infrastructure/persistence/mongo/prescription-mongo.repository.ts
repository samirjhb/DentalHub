import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PrescriptionRepository,
  CreatePrescriptionData,
  FindPrescriptionsFilter,
} from '../../../domain/repositories/prescription.repository';
import { Prescription as PrescriptionEntity } from '../../../domain/entities/prescription.entity';
import { Prescription, PrescriptionDocument } from './prescription.schema';
import { PatientDocument } from 'src/patient/infrastructure/persistence/mongo/patient.schema';
import { AuthDocument } from 'src/auth/infrastructure/persistence/mongo/auth.schema';
import { ClinicalRecordDocument } from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import { Role } from 'src/shared/enums/role.enum';
import { PrescriptionMapper } from '../../../application/mappers/prescription.mapper';

@Injectable()
export class PrescriptionMongoRepository extends PrescriptionRepository {
  constructor(
    @InjectModel(Prescription.name)
    private readonly prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel('Patient')
    private readonly patientModel: Model<PatientDocument>,
    @InjectModel('Auth')
    private readonly authModel: Model<AuthDocument>,
    @InjectModel('ClinicalRecord')
    private readonly clinicalRecordModel: Model<ClinicalRecordDocument>,
  ) {
    super();
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    const patient = await this.patientModel.findById(patientId);
    return !!patient;
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    const dentist = await this.authModel.findOne({
      _id: dentistId,
      role: Role.DENTIST,
    });
    return !!dentist;
  }

  async verifyClinicalRecordExists(clinicalRecordId: string): Promise<boolean> {
    const clinicalRecord = await this.clinicalRecordModel.findById(clinicalRecordId);
    return !!clinicalRecord;
  }

  async create(data: CreatePrescriptionData): Promise<PrescriptionEntity> {
    const created = await this.prescriptionModel.create({
      ...data,
      issuedAt: new Date(),
    });
    return PrescriptionMapper.toDomain(created);
  }

  async findAll(filter: FindPrescriptionsFilter): Promise<PrescriptionEntity[]> {
    const query: Record<string, unknown> = {};
    if (filter.patient) query.patient = filter.patient;
    if (filter.dentist) query.dentist = filter.dentist;
    if (filter.clinicalRecord) query.clinicalRecord = filter.clinicalRecord;
    const docs = await this.prescriptionModel
      .find(query)
      .sort({ issuedAt: -1 })
      .populate('patient')
      // Proyección explícita: Auth no tiene `select:false` en `password`, un
      // populate sin campos filtraría el hash — nunca replicar el populate
      // "pelado" que usa clinical-record para 'patient' cuando el ref es 'Auth'.
      .populate('dentist', 'name email');
    return docs.map((doc) => PrescriptionMapper.toDomain(doc));
  }

  async findById(id: string): Promise<PrescriptionEntity | null> {
    const doc = await this.prescriptionModel
      .findById(id)
      .populate('patient')
      .populate('dentist', 'name email');
    return doc ? PrescriptionMapper.toDomain(doc) : null;
  }
}
