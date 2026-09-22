import { ClinicalRecord } from '../entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../entities/clinical-record-treatment.entity';
import { ClinicalRecordAttachment } from '../entities/clinical-record-attachment.entity';
import { CreateClinicalRecordDto } from '../../application/dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../../application/dto/update-clinical-record.dto';
import { FilterClinicalRecordDto } from '../../application/dto/filter-clinical-record.dto';

export abstract class ClinicalRecordRepository {
  // Chequeo de existencia de paciente — resuelto contra el mismo token literal
  // 'Patient' ya registrado en el módulo, sin depender del PatientRepository
  // de `patient` (evita acoplar los dos bounded contexts).
  abstract verifyPatientExists(patientId: string): Promise<boolean>;

  abstract create(dto: CreateClinicalRecordDto): Promise<ClinicalRecord>;
  abstract findWithFilters(
    filter: FilterClinicalRecordDto,
    skip?: number,
    limit?: number,
  ): Promise<ClinicalRecord[]>;
  abstract count(filter: FilterClinicalRecordDto): Promise<number>;
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

  // $push/$pull atómicos (no el patrón "traer todo y reemplazar" que usa
  // updateTreatments) — dos subidas en paralelo sobre la misma ficha (el
  // usuario selecciona varias imágenes a la vez) no deben pisarse entre sí.
  abstract addAttachment(
    id: string,
    attachment: Omit<ClinicalRecordAttachment, '_id'>,
  ): Promise<ClinicalRecord | null>;
  abstract removeAttachment(
    id: string,
    attachmentId: string,
  ): Promise<ClinicalRecord | null>;
}
