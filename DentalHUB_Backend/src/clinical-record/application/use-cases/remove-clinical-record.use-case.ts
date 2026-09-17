import { Injectable, NotFoundException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';

@Injectable()
export class RemoveClinicalRecordUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string) {
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
    }
    return {
      deleted: true,
      message: `Ficha clínica con ID ${id} eliminada correctamente`,
    };
  }
}
