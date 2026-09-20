import { Injectable } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';
import { FindAllClinicalRecordsQueryDto } from '../dto/find-all-clinical-records-query.dto';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindAllClinicalRecordsUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(query?: FindAllClinicalRecordsQueryDto) {
    if (isPaginationRequested(query)) {
      const { page, limit, skip } = resolvePagination(query);
      const [records, total] = await Promise.all([
        this.repository.findWithFilters({}, skip, limit),
        this.repository.count({}),
      ]);
      return buildPaginatedResult(
        records.map((r) => ClinicalRecordMapper.toResponse(r)),
        total,
        page,
        limit,
      );
    }

    const records = await this.repository.findWithFilters({});
    return records.map((r) => ClinicalRecordMapper.toResponse(r));
  }
}
