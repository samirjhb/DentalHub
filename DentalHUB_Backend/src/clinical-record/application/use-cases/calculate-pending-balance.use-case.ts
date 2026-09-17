import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';

@Injectable()
export class CalculatePendingBalanceUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(
    id: string,
    treatmentIndex: number,
  ): Promise<{ pendingBalance: number; percentagePaid: number }> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (!record.treatments || treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    const treatment = record.treatments[treatmentIndex];
    const totalPrice = treatment.price || 0;
    const totalDeposit = treatment.deposit || 0;
    const pendingBalance = totalPrice - totalDeposit;
    const percentagePaid =
      totalPrice > 0 ? (totalDeposit / totalPrice) * 100 : 0;

    return {
      pendingBalance,
      percentagePaid,
    };
  }
}
