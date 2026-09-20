import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecord } from '../../domain/entities/clinical-record.entity';
import { ClinicalRecordTreatment } from '../../domain/entities/clinical-record-treatment.entity';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';
import { UpdateClinicalRecordDto } from '../dto/update-clinical-record.dto';
import { FilterClinicalRecordDto } from '../dto/filter-clinical-record.dto';

export class InMemoryClinicalRecordRepository extends ClinicalRecordRepository {
  private records: ClinicalRecord[] = [];
  private existingPatientIds = new Set<string>();
  private nextId = 1;

  // Helper de test, no forma parte del puerto real.
  seedPatient(patientId: string): void {
    this.existingPatientIds.add(patientId);
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    return this.existingPatientIds.has(patientId);
  }

  async create(dto: CreateClinicalRecordDto): Promise<ClinicalRecord> {
    const treatments = dto.treatments.map(
      (t) =>
        new ClinicalRecordTreatment(
          t.diagnosis,
          t.toothNumber,
          t.treatment,
          t.price,
          t.status || 'Pendiente',
          t.radiography,
          t.deposit || 0,
          t.appointmentDate,
          t.observations,
        ),
    );
    const record = new ClinicalRecord(
      String(this.nextId++),
      dto.patient,
      treatments,
      dto.dentist,
      dto.attachments,
      new Date(),
      new Date(),
      0,
    );
    this.records.push(record);
    return record;
  }

  // El stub nunca implementó filtrado real (ver comentario histórico en el
  // repo Mongo) — se preserva esa fidelidad acá, solo se agrega skip/limit.
  async findWithFilters(
    _filter: FilterClinicalRecordDto,
    skip?: number,
    limit?: number,
  ): Promise<ClinicalRecord[]> {
    if (skip === undefined && limit === undefined) return this.records;
    const start = skip ?? 0;
    return limit === undefined
      ? this.records.slice(start)
      : this.records.slice(start, start + limit);
  }

  async count(_filter: FilterClinicalRecordDto): Promise<number> {
    return this.records.length;
  }

  async findByPatient(patientId: string): Promise<ClinicalRecord[]> {
    return this.records.filter((r) => r.patient === patientId);
  }

  async findById(id: string): Promise<ClinicalRecord | null> {
    return this.records.find((r) => r._id === id) ?? null;
  }

  async findByIdWithPatient(id: string): Promise<ClinicalRecord | null> {
    return this.findById(id);
  }

  async update(
    id: string,
    dto: UpdateClinicalRecordDto,
  ): Promise<ClinicalRecord | null> {
    const record = await this.findById(id);
    if (!record) return null;
    Object.assign(record, dto);
    return record;
  }

  async updateTreatments(
    id: string,
    treatments: ClinicalRecordTreatment[],
  ): Promise<ClinicalRecord | null> {
    const record = await this.findById(id);
    if (!record) return null;
    record.treatments = treatments;
    return record;
  }

  async deleteById(id: string): Promise<boolean> {
    const before = this.records.length;
    this.records = this.records.filter((r) => r._id !== id);
    return this.records.length < before;
  }
}
