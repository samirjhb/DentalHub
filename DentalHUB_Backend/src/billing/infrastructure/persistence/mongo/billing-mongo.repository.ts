import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BillingRepository,
  ClinicalRecordSummary,
  CreatePaymentData,
  FindPaymentsFilter,
} from '../../../domain/repositories/billing.repository';
import { Payment as PaymentEntity } from '../../../domain/entities/payment.entity';
import { PaymentMethod } from '../../../domain/entities/payment-method.enum';
import { Payment, PaymentDocument } from './payment.schema';
import {
  ClinicalRecord,
  ClinicalRecordDocument,
} from 'src/clinical-record/infrastructure/persistence/mongo/clinical-record.schema';
import { AuthDocument } from 'src/auth/infrastructure/persistence/mongo/auth.schema';

@Injectable()
export class BillingMongoRepository extends BillingRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(ClinicalRecord.name)
    private readonly clinicalRecordModel: Model<ClinicalRecordDocument>,
    @InjectModel('Auth')
    private readonly authModel: Model<AuthDocument>,
  ) {
    super();
  }

  private toSummary(doc: ClinicalRecordDocument): ClinicalRecordSummary {
    return {
      _id: doc._id,
      patient: doc.patient,
      dentist: doc.dentist,
      attachments: doc.attachments,
      createdAt: (doc as unknown as { createdAt?: Date }).createdAt,
      updatedAt: (doc as unknown as { updatedAt?: Date }).updatedAt,
      treatments: (doc.treatments ?? []).map((t) => ({
        diagnosis: t.diagnosis,
        toothNumber: t.toothNumber,
        treatment: t.treatment,
        price: t.price,
        status: t.status,
        radiography: t.radiography,
        deposit: t.deposit,
        appointmentDate: t.appointmentDate,
        observations: t.observations,
      })),
    };
  }

  async findClinicalRecordById(
    id: string,
  ): Promise<ClinicalRecordSummary | null> {
    const doc = await this.clinicalRecordModel.findById(id);
    return doc ? this.toSummary(doc) : null;
  }

  // Replica la MISMA estrategia exacta de AddDepositUseCase (fetch completo,
  // mutar en JS incluida la marca status='Completado', reemplazar el array
  // entero) — ver comentario en clinical-record/.../add-deposit.use-case.ts.
  async incrementTreatmentDeposit(
    clinicalRecordId: string,
    treatmentIndex: number,
    amount: number,
  ): Promise<ClinicalRecordSummary> {
    const doc = await this.clinicalRecordModel.findById(clinicalRecordId);
    if (!doc) {
      throw new NotFoundException(
        `Ficha clínica con ID ${clinicalRecordId} no encontrada`,
      );
    }

    const treatment = doc.treatments[treatmentIndex];
    const currentDeposit = treatment.deposit || 0;
    treatment.deposit = currentDeposit + amount;
    if (treatment.deposit >= treatment.price) {
      treatment.status = 'Completado';
    }

    const updated = await this.clinicalRecordModel.findByIdAndUpdate(
      clinicalRecordId,
      { treatments: doc.treatments },
      { new: true },
    );
    return this.toSummary(updated!);
  }

  async verifyRegisteredByExists(userId: string): Promise<boolean> {
    const user = await this.authModel.findById(userId);
    return !!user;
  }

  async create(data: CreatePaymentData): Promise<PaymentEntity> {
    const created = await this.paymentModel.create({
      ...data,
      paidAt: new Date(),
    });
    return this.toDomain(created);
  }

  async findAll(filter: FindPaymentsFilter): Promise<PaymentEntity[]> {
    const query: Record<string, unknown> = {};
    if (filter.patient) query.patient = filter.patient;
    if (filter.clinicalRecord) query.clinicalRecord = filter.clinicalRecord;
    if (filter.startDate || filter.endDate) {
      query.paidAt = {
        ...(filter.startDate ? { $gte: filter.startDate } : {}),
        ...(filter.endDate ? { $lte: filter.endDate } : {}),
      };
    }
    const docs = await this.paymentModel.find(query).sort({ paidAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findClinicalRecordsByPatient(
    patientId: string,
  ): Promise<ClinicalRecordSummary[]> {
    const docs = await this.clinicalRecordModel.find({ patient: patientId });
    return docs.map((doc) => this.toSummary(doc));
  }

  async findAllClinicalRecords(): Promise<ClinicalRecordSummary[]> {
    const docs = await this.clinicalRecordModel.find();
    return docs.map((doc) => this.toSummary(doc));
  }

  private toDomain(doc: PaymentDocument): PaymentEntity {
    return new PaymentEntity(
      doc._id,
      doc.clinicalRecord,
      doc.treatmentIndex,
      doc.patient,
      doc.amount,
      doc.method as PaymentMethod,
      doc.registeredBy,
      doc.paidAt,
      doc.observations,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }
}
