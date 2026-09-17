import { Injectable, NotFoundException } from '@nestjs/common';
import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import { OdontogramMapper } from '../mappers/odontogram.mapper';

@Injectable()
export class UpdateGeneralObservationsUseCase {
  constructor(private readonly repository: OdontogramRepository) {}

  async execute(patientId: string, observations: string) {
    const updated = await this.repository.updateGeneralObservations(
      patientId,
      observations,
    );
    if (!updated) {
      throw new NotFoundException(
        `Odontograma no encontrado para el paciente ${patientId}`,
      );
    }
    return OdontogramMapper.toResponse(updated);
  }
}
