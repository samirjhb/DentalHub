import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';

@Injectable()
export class CalculateTotalClinicBalanceUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(): Promise<{ totalPendingBalance: number }> {
    const records = await this.repository.findAllClinicalRecords();

    let totalPendingBalance = 0;
    for (const record of records) {
      for (const treatment of record.treatments) {
        totalPendingBalance += (treatment.price || 0) - (treatment.deposit || 0);
      }
    }

    return { totalPendingBalance };
  }
}
