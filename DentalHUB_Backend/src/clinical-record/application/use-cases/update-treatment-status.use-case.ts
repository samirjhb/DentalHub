import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class UpdateTreatmentStatusUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, status: string, treatmentIndex = 0) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (
      !['Pendiente', 'En proceso', 'Completado', 'Cancelado'].includes(status)
    ) {
      throw new BadRequestException(
        'Estado no válido. Debe ser: Pendiente, En proceso, Completado o Cancelado',
      );
    }

    if (!record.treatments || treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    record.treatments[treatmentIndex].status = status;
    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
