import { Injectable, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordTreatment } from '../../domain/entities/clinical-record-treatment.entity';
import { AddTreatmentDto } from '../dto/add-treatment.dto';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class AddTreatmentUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, dto: AddTreatmentDto) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }

    const newTreatment = new ClinicalRecordTreatment(
      dto.diagnosis,
      dto.toothNumber,
      dto.treatment,
      dto.price,
      dto.status || 'Pendiente',
      dto.radiography,
      dto.deposit || 0,
      dto.appointmentDate,
      dto.observations,
    );

    record.treatments.push(newTreatment);
    const updated = await this.repository.updateTreatments(
      id,
      record.treatments,
    );
    return ClinicalRecordMapper.toResponse(updated!);
  }
}
