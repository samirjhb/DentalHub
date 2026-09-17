import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';

@Injectable()
export class CalculatePatientBalanceUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(patientId: string): Promise<{
    totalPrice: number;
    totalPaid: number;
    pendingBalance: number;
    percentagePaid: number;
  }> {
    const records = await this.repository.findClinicalRecordsByPatient(
      patientId,
    );

    // Un paciente sin fichas es un caso válido (agregado sobre una colección
    // que puede estar legítimamente vacía) — no es un 404, es saldo cero.
    let totalPrice = 0;
    let totalPaid = 0;
    for (const record of records) {
      for (const treatment of record.treatments) {
        totalPrice += treatment.price || 0;
        totalPaid += treatment.deposit || 0;
      }
    }

    const pendingBalance = totalPrice - totalPaid;
    const percentagePaid = totalPrice > 0 ? (totalPaid / totalPrice) * 100 : 0;

    return { totalPrice, totalPaid, pendingBalance, percentagePaid };
  }
}
