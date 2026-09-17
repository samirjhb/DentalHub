import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClinicalRecordRepository } from '../../domain/repositories/clinical-record.repository';
import { CreateClinicalRecordDto } from '../dto/create-clinical-record.dto';
import { ClinicalRecordMapper } from '../mappers/clinical-record.mapper';

@Injectable()
export class CreateClinicalRecordUseCase {
  constructor(private readonly repository: ClinicalRecordRepository) {}

  async execute(dto: CreateClinicalRecordDto) {
    try {
      const patientExists = await this.repository.verifyPatientExists(
        dto.patient,
      );
      if (!patientExists) {
        throw new NotFoundException(
          `Paciente con ID ${dto.patient} no encontrado`,
        );
      }

      const created = await this.repository.create(dto);
      return ClinicalRecordMapper.toResponse(created);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear la ficha clínica: ${error.message}`,
      );
    }
  }
}
