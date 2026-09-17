import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import { ToothState } from '../../domain/entities/tooth-state.entity';
import { FDI_TOOTH_NUMBERS } from '../../domain/constants/fdi-tooth-numbers.constant';
import { CreateOdontogramDto } from '../dto/create-odontogram.dto';
import { OdontogramMapper } from '../mappers/odontogram.mapper';

@Injectable()
export class CreateOdontogramUseCase {
  constructor(private readonly repository: OdontogramRepository) {}

  async execute(dto: CreateOdontogramDto) {
    const patientExists = await this.repository.verifyPatientExists(
      dto.patient,
    );
    if (!patientExists) {
      throw new NotFoundException(
        `Paciente con ID ${dto.patient} no encontrado`,
      );
    }

    const existing = await this.repository.findByPatientId(dto.patient);
    if (existing) {
      throw new BadRequestException(
        'Ya existe un odontograma para este paciente',
      );
    }

    const teeth = FDI_TOOTH_NUMBERS.map((toothNumber) => new ToothState(toothNumber));
    const created = await this.repository.create(dto.patient, teeth);
    return OdontogramMapper.toResponse(created);
  }
}
