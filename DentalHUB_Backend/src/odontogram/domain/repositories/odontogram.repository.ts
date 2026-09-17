import { Odontogram } from '../entities/odontogram.entity';
import { ToothState, ToothStatus } from '../entities/tooth-state.entity';

export abstract class OdontogramRepository {
  // Backed por el mismo token independiente 'Patient' que ya usa clinical-record —
  // no se acopla al PatientRepository del módulo `patient`.
  abstract verifyPatientExists(patientId: string): Promise<boolean>;

  abstract findByPatientId(patientId: string): Promise<Odontogram | null>;
  abstract create(patientId: string, teeth: ToothState[]): Promise<Odontogram>;
  abstract updateTooth(
    patientId: string,
    toothNumber: string,
    status: ToothStatus,
    observations?: string,
  ): Promise<Odontogram | null>;
  abstract updateGeneralObservations(
    patientId: string,
    observations: string,
  ): Promise<Odontogram | null>;
}
