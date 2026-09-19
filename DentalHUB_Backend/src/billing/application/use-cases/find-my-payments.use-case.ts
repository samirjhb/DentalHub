import { Injectable } from '@nestjs/common';
import { FindPaymentsUseCase } from './find-payments.use-case';
import { FilterMyPaymentDto } from '../dto/filter-my-payment.dto';

@Injectable()
export class FindMyPaymentsUseCase {
  constructor(private readonly findPaymentsUseCase: FindPaymentsUseCase) {}

  async execute(patientId: string, filter: FilterMyPaymentDto) {
    return this.findPaymentsUseCase.execute({
      patient: patientId,
      startDate: filter.startDate,
      endDate: filter.endDate,
    });
  }
}
