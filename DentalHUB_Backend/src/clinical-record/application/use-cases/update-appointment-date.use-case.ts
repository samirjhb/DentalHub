import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class UpdateAppointmentDateUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, date: Date, treatmentIndex = 0) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    if (!record.treatments || treatmentIndex >= record.treatments.length) {
      throw new BadRequestException(
        `Tratamiento con índice ${treatmentIndex} no encontrado`,
      );
    }

    record.treatments[treatmentIndex].appointmentDate = date;
    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
