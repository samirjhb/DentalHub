import { Injectable, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { PrescriptionMapper } from '../mappers/prescription.mapper';

@Injectable()
export class FindPrescriptionByIdUseCase {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(id: string) {
    const prescription = await this.repository.findById(id);
    if (!prescription) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }
    return PrescriptionMapper.toResponse(prescription);
  }
}
