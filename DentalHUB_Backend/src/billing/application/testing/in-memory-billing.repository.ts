import {
  BillingRepository,
  ClinicalRecordSummary,
  CreatePaymentData,
  FindPaymentsFilter,
} from '../../domain/repositories/billing.repository';
import { Payment } from '../../domain/entities/payment.entity';

export class InMemoryBillingRepository extends BillingRepository {
  private clinicalRecords = new Map<string, ClinicalRecordSummary>();
  private registeredUserIds = new Set<string>();
  private payments: Payment[] = [];
  private nextId = 1;

  // Helpers de test, no forman parte del puerto real.
  seedClinicalRecord(id: string, record: ClinicalRecordSummary): void {
    this.clinicalRecords.set(id, record);
  }

  seedUser(userId: string): void {
    this.registeredUserIds.add(userId);
  }

  async findClinicalRecordById(
    id: string,
  ): Promise<ClinicalRecordSummary | null> {
    return this.clinicalRecords.get(id) ?? null;
  }

  async incrementTreatmentDeposit(
    clinicalRecordId: string,
    treatmentIndex: number,
    amount: number,
  ): Promise<ClinicalRecordSummary> {
    const record = this.clinicalRecords.get(clinicalRecordId)!;
    const treatment = record.treatments[treatmentIndex];
    treatment.deposit = (treatment.deposit || 0) + amount;
    if (treatment.deposit >= treatment.price) {
      treatment.status = 'Completado';
    }
    return record;
  }

  async verifyRegisteredByExists(userId: string): Promise<boolean> {
    return this.registeredUserIds.has(userId);
  }

  async create(data: CreatePaymentData): Promise<Payment> {
    const payment = new Payment(
      String(this.nextId++),
      data.clinicalRecord,
      data.treatmentIndex,
      data.patient,
      data.amount,
      data.method,
      data.registeredBy,
      new Date(),
      data.observations,
      new Date(),
      new Date(),
    );
    this.payments.push(payment);
    return payment;
  }

  async findAll(filter: FindPaymentsFilter): Promise<Payment[]> {
    return this.payments.filter((p) => {
      if (filter.patient && p.patient !== filter.patient) return false;
      if (filter.clinicalRecord && p.clinicalRecord !== filter.clinicalRecord)
        return false;
      if (filter.startDate && p.paidAt < filter.startDate) return false;
      if (filter.endDate && p.paidAt > filter.endDate) return false;
      return true;
    });
  }

  async findClinicalRecordsByPatient(
    patientId: string,
  ): Promise<ClinicalRecordSummary[]> {
    return [...this.clinicalRecords.values()].filter(
      (r) => r.patient === patientId,
    );
  }

  async findAllClinicalRecords(): Promise<ClinicalRecordSummary[]> {
    return [...this.clinicalRecords.values()];
  }
}
