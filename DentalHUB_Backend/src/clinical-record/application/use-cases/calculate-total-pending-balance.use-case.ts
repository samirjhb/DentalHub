import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';

@Injectable()
export class CalculateTotalPendingBalanceUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string): Promise<{
    totalPrice: number;
    totalPaid: number;
    pendingBalance: number;
    percentagePaid: number;
  }> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (!record.treatments || record.treatments.length === 0) {
      throw new BadRequestException(
        `La ficha clínica no contiene tratamientos`,
      );
    }

    let totalPrice = 0;
    let totalPaid = 0;

    record.treatments.forEach((treatment) => {
      totalPrice += treatment.price || 0;
      totalPaid += treatment.deposit || 0;
    });

    const pendingBalance = totalPrice - totalPaid;
    const percentagePaid = totalPrice > 0 ? (totalPaid / totalPrice) * 100 : 0;

    return {
      totalPrice,
      totalPaid,
      pendingBalance,
      percentagePaid,
    };
  }
}
