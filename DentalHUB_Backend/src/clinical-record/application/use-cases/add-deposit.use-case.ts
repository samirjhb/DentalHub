import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class AddDepositUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, amount: number, treatmentIndex = 0) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (amount <= 0) {
      throw new BadRequestException('El monto del abono debe ser mayor a cero');
    }

    if (!record.treatments || treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    const treatment = record.treatments[treatmentIndex];
    const currentDeposit = treatment.deposit || 0;
    treatment.deposit = currentDeposit + amount;

    // Si el abono completa el pago, actualizar el estado (silencioso, sin
    // guardia de "ya estaba completado" — se preserva igual que hoy).
    if (treatment.deposit >= treatment.price) {
      treatment.status = 'Completado';
    }

    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
