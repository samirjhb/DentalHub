import {
  PrescriptionRepository,
  CreatePrescriptionData,
  FindPrescriptionsFilter,
} from '../../domain/repositories/prescription.repository';
import { Prescription } from '../../domain/entities/prescription.entity';

export class InMemoryPrescriptionRepository extends PrescriptionRepository {
  private prescriptions: Prescription[] = [];
  private existingPatientIds = new Set<string>();
  private existingDentistIds = new Set<string>();
  private existingClinicalRecordIds = new Set<string>();
  private nextId = 1;

  // Helpers de test, no forman parte del puerto real.
  seedPatient(patientId: string): void {
    this.existingPatientIds.add(patientId);
  }

  seedDentist(dentistId: string): void {
    this.existingDentistIds.add(dentistId);
  }

  seedClinicalRecord(clinicalRecordId: string): void {
    this.existingClinicalRecordIds.add(clinicalRecordId);
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    return this.existingPatientIds.has(patientId);
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    return this.existingDentistIds.has(dentistId);
  }

  async verifyClinicalRecordExists(clinicalRecordId: string): Promise<boolean> {
    return this.existingClinicalRecordIds.has(clinicalRecordId);
  }

  async create(data: CreatePrescriptionData): Promise<Prescription> {
    const prescription = new Prescription(
      String(this.nextId++),
      data.patient,
      data.dentist,
      data.medications,
      new Date(),
      data.clinicalRecord,
      data.observations,
      new Date(),
      new Date(),
    );
    this.prescriptions.push(prescription);
    return prescription;
  }

  async findAll(filter: FindPrescriptionsFilter): Promise<Prescription[]> {
    return this.prescriptions.filter((p) => {
      if (filter.patient && p.patient !== filter.patient) return false;
      if (filter.dentist && p.dentist !== filter.dentist) return false;
      if (filter.clinicalRecord && p.clinicalRecord !== filter.clinicalRecord)
        return false;
      return true;
    });
  }

  async findById(id: string): Promise<Prescription | null> {
    return this.prescriptions.find((p) => String(p._id) === id) ?? null;
  }
}
