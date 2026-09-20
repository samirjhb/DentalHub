import { Payment } from '../entities/payment.entity';
import { PaymentMethod } from '../entities/payment-method.enum';

// Modelo de lectura propio de Billing para clinical-record — independiente
// del dominio de `clinical-record` (que no se importa), pero con el mismo
// shape que ya expone `ClinicalRecordMapper.toResponse`, para que el
// frontend pueda seguir recalculando localmente sin cambios.
export interface ClinicalRecordTreatmentSummary {
  diagnosis: string;
  toothNumber: string;
  treatment: string;
  price: number;
  status: string;
  radiography?: string[];
  deposit: number;
  appointmentDate?: Date;
  observations?: string;
}

export interface ClinicalRecordSummary {
  _id: unknown;
  patient: unknown;
  treatments: ClinicalRecordTreatmentSummary[];
  dentist: string;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePaymentData {
  clinicalRecord: string;
  treatmentIndex: number;
  patient: unknown;
  amount: number;
  method: PaymentMethod;
  registeredBy: string;
  observations?: string;
}

export interface FindPaymentsFilter {
  patient?: string;
  clinicalRecord?: string;
  startDate?: Date;
  endDate?: Date;
}

export abstract class BillingRepository {
  // Bindings independientes a 'ClinicalRecord'/'Auth', mismo patrón ya usado
  // por odontogram/appointment con 'Patient' — evita acoplar bounded contexts.
  abstract findClinicalRecordById(
    id: string,
  ): Promise<ClinicalRecordSummary | null>;

  // Replica la MISMA estrategia exacta de AddDepositUseCase (fetch completo
  // del documento, mutar `treatments[i]` en JS incluida la marca
  // status='Completado', reemplazar el array entero) — ver comentario en
  // clinical-record/application/use-cases/add-deposit.use-case.ts. Un cambio
  // futuro a esa regla de negocio debe reflejarse acá también.
  abstract incrementTreatmentDeposit(
    clinicalRecordId: string,
    treatmentIndex: number,
    amount: number,
  ): Promise<ClinicalRecordSummary>;

  abstract verifyRegisteredByExists(userId: string): Promise<boolean>;

  abstract create(data: CreatePaymentData): Promise<Payment>;
  abstract findAll(
    filter: FindPaymentsFilter,
    skip?: number,
    limit?: number,
  ): Promise<Payment[]>;
  abstract count(filter: FindPaymentsFilter): Promise<number>;

  // Saldo agregado de un paciente sumando pendingBalance de TODAS sus fichas.
  abstract findClinicalRecordsByPatient(
    patientId: string,
  ): Promise<ClinicalRecordSummary[]>;

  // Saldo pendiente de TODA la clínica (todas las fichas, todos los pacientes).
  abstract findAllClinicalRecords(): Promise<ClinicalRecordSummary[]>;
}
