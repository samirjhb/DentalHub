import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';
import { FilterPaymentDto } from '../dto/filter-payment.dto';
import { PaymentMapper } from '../mappers/payment.mapper';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindPaymentsUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(filter: FilterPaymentDto) {
    const repoFilter = {
      patient: filter.patient,
      clinicalRecord: filter.clinicalRecord,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    };

    if (isPaginationRequested(filter)) {
      const { page, limit, skip } = resolvePagination(filter);
      const [payments, total] = await Promise.all([
        this.repository.findAll(repoFilter, skip, limit),
        this.repository.count(repoFilter),
      ]);
      return buildPaginatedResult(
        payments.map((p) => PaymentMapper.toResponse(p)),
        total,
        page,
        limit,
      );
    }

    const payments = await this.repository.findAll(repoFilter);
    return { payments: payments.map((p) => PaymentMapper.toResponse(p)) };
  }
}
