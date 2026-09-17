import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import { UpdateToothDto } from '../dto/update-tooth.dto';
import { OdontogramMapper } from '../mappers/odontogram.mapper';

@Injectable()
export class UpdateToothUseCase {
  constructor(private readonly repository: OdontogramRepository) {}

  async execute(patientId: string, toothNumber: string, dto: UpdateToothDto) {
    const odontogram = await this.repository.findByPatientId(patientId);
    if (!odontogram) {
      throw new NotFoundException(
        `Odontograma no encontrado para el paciente ${patientId}`,
      );
    }

    const tooth = odontogram.teeth.find((t) => t.toothNumber === toothNumber);
    if (!tooth) {
      throw new BadRequestException(`Pieza dental ${toothNumber} no válida`);
    }

    const updated = await this.repository.updateTooth(
      patientId,
      toothNumber,
      dto.status,
      dto.observations,
    );
    return OdontogramMapper.toResponse(updated!);
  }
}
