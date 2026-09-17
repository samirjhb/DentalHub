import { ClinicalRecord } from '../entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../entities/clinical-record-treatment.entity';
import { CreateClinicalRecordDto } from '../../application/dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../../application/dto/update-clinical-record.dto';
import { FilterClinicalRecordDto } from '../../application/dto/filter-clinical-record.dto';

export abstract class ClinicalRecordRepository {
  // Chequeo de existencia de paciente — resuelto contra el mismo token literal
  // 'Patient' ya registrado en el módulo, sin depender del PatientRepository
  // de `patient` (evita acoplar los dos bounded contexts).
  abstract verifyPatientExists(patientId: string): Promise<boolean>;

  abstract create(dto: CreateClinicalRecordDto): Promise<ClinicalRecord>;
  abstract findAll(): Promise<ClinicalRecord[]>;
  abstract findWithFilters(
    filter: FilterClinicalRecordDto,
  ): Promise<ClinicalRecord[]>;
  abstract findByPatient(patientId: string): Promise<ClinicalRecord[]>; // sin uso en ningún controller, se preserva igual
  abstract findById(id: string): Promise<ClinicalRecord | null>; // sin poblar
  abstract findByIdWithPatient(id: string): Promise<ClinicalRecord | null>; // poblado, solo lo usa findOne
  abstract update(
    id: string,
    dto: UpdateClinicalRecordDto,
  ): Promise<ClinicalRecord | null>;
  abstract updateTreatments(
    id: string,
    treatments: ClinicalRecordTreatment[],
  ): Promise<ClinicalRecord | null>;
  abstract deleteById(id: string): Promise<boolean>;
}
