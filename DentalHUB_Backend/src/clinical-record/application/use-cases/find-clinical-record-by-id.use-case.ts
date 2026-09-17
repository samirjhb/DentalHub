import { Injectable, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class FindClinicalRecordByIdUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string) {
    const record = await this.repository.findByIdWithPatient(id);
    if (!record) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }
    return ClinicalRecordMapper.toResponse(record);
  }
}
