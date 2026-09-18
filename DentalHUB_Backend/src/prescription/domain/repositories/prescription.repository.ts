import { Prescription } from '../entities/prescription.entity';
import { Medication } from '../entities/medication.entity';

export interface CreatePrescriptionData {
  patient: string;
  dentist: string;
  medications: Medication[];
  clinicalRecord?: string;
  observations?: string;
}

export interface FindPrescriptionsFilter {
  patient?: string;
  dentist?: string;
  clinicalRecord?: string;
}

export abstract class PrescriptionRepository {
  // Backed por los mismos tokens independientes 'Patient'/'Auth'/'ClinicalRecord'
  // que ya usan clinical-record/odontogram/appointment/billing — no se acopla a
  // los repositorios de esos módulos.
  abstract verifyPatientExists(patientId: string): Promise<boolean>;
  // Además de existir, confirma que el usuario tiene rol DENTIST.
  abstract verifyDentistExists(dentistId: string): Promise<boolean>;
  abstract verifyClinicalRecordExists(clinicalRecordId: string): Promise<boolean>;

  abstract create(data: CreatePrescriptionData): Promise<Prescription>;
  abstract findAll(filter: FindPrescriptionsFilter): Promise<Prescription[]>;
  abstract findById(id: string): Promise<Prescription | null>;
}
