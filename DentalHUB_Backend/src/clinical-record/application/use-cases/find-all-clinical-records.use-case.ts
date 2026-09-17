import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class FindAllClinicalRecordsUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute() {
    const records = await this.repository.findAll();
    return records.map((r) => ClinicalRecordMapper.toResponse(r));
  }
}
