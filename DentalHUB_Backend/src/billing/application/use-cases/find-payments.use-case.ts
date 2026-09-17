import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';
import { FilterPaymentDto } from '../dto/filter-payment.dto';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class FindPaymentsUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(filter: FilterPaymentDto) {
    const payments = await this.repository.findAll({
      patient: filter.patient,
      clinicalRecord: filter.clinicalRecord,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    });
    return { payments: payments.map((p) => PaymentMapper.toResponse(p)) };
  }
}
