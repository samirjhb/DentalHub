import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { FilterClinicalRecordDto } from '../dto/filter-clinical-record.dto';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindClinicalRecordsWithFiltersUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(filterDto: FilterClinicalRecordDto) {
    if (isPaginationRequested(filterDto)) {
      const { page, limit, skip } = resolvePagination(filterDto);
      const [records, total] = await Promise.all([
        this.repository.findWithFilters(filterDto, skip, limit),
        this.repository.count(filterDto),
      ]);
      return buildPaginatedResult(
        records.map((r) => ClinicalRecordMapper.toResponse(r)),
        total,
        page,
        limit,
      );
    }

    const records = await this.repository.findWithFilters(filterDto);
    return records.map((r) => ClinicalRecordMapper.toResponse(r));
  }
}
