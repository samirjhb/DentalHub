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

    if (record.treatments.length === 1) {
      throw new BadRequestException(
        'No se puede eliminar el último tratamiento de una ficha clínica. Elimine la ficha completa si ya no es necesaria.',
      );
    }

    record.treatments.splice(treatmentIndex, 1);

    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
