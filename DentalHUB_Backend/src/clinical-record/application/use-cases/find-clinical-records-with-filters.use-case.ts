import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { FilterClinicalRecordDto } from '../dto/filter-clinical-record.dto';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class FindClinicalRecordsWithFiltersUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(filterDto: FilterClinicalRecordDto) {
    const records = await this.repository.findWithFilters(filterDto);
    return records.map((r) => ClinicalRecordMapper.toResponse(r));
  }
}
