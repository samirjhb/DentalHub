import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { PatientClinicalSummaryMapper } from '../mappers/patient-clinical-summary.mapper';

@Injectable()
export class FindMyClinicalSummaryUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(patientId: string) {
    const records = await this.repository.findByPatient(patientId);
    return PatientClinicalSummaryMapper.toResponse(records);
  }
}
