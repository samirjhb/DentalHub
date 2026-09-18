import { Injectable } from '@nestjs/common';
import { ReportsRepository } from '../../domain/repositories/reports.repository';
import { ReportsDateRangeDto } from '../dto/reports-date-range.dto';

@Injectable()
export class GetRevenueReportUseCase {
  constructor(private readonly repository: ReportsRepository) {}

  async execute(dto: ReportsDateRangeDto) {
    return this.repository.getRevenueSummary({
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }
}
