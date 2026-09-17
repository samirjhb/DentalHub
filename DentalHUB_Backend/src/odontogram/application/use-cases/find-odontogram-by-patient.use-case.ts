import { Injectable, NotFoundException } from '@nestjs/common';
import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import { OdontogramMapper } from '../mappers/odontogram.mapper';

@Injectable()
export class FindOdontogramByPatientUseCase {
  constructor(private readonly repository: OdontogramRepository) {}

  async execute(patientId: string) {
    const odontogram = await this.repository.findByPatientId(patientId);
    if (!odontogram) {
      throw new NotFoundException(
        `Odontograma no encontrado para el paciente ${patientId}`,
      );
    }
    return OdontogramMapper.toResponse(odontogram);
  }
}
