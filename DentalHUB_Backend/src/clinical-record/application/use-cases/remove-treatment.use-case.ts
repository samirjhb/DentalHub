import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class RemoveTreatmentUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, treatmentIndex: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (!record.treatments || treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    record.treatments.splice(treatmentIndex, 1);

    if (record.treatments.length === 0) {
      // Quirk preservado a propósito: la ficha se elimina de verdad, pero el
      // cliente igual ve un error 400 — no se "arregla" en esta migración.
      await this.repository.deleteById(id);
      throw new BadRequestException(
        `La ficha clínica ha sido eliminada porque no contiene tratamientos`,
      );
    }

    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
