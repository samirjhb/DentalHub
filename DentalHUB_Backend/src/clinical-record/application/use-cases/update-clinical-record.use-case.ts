import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { UpdateClinicalRecordDto } from '../dto/update-clinical-record.dto';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class UpdateClinicalRecordUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(id: string, dto: UpdateClinicalRecordDto) {
    try {
      if (dto.patient) {
        const patientExists = await this.repository.verifyPatientExists(
          dto.patient,
        );
        if (!patientExists) {
          throw new NotFoundException(
            `Paciente con ID ${dto.patient} no encontrado`,
          );
        }
      }

      const updated = await this.repository.update(id, dto);

      if (!updated) {
        throw new NotFoundException(`Ficha clínica con ID ${id} no encontrada`);
      }

      return ClinicalRecordMapper.toResponse(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar la ficha clínica: ${error.message}`,
      );
    }
  }
}
