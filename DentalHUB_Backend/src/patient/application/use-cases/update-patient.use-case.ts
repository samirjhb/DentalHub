import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { PatientMapper } from '../mappers/patient.mapper';

@Injectable()
export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: string, dto: UpdatePatientDto) {
    try {
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }

      if (dto.rut && dto.rut !== existingPatient.rut) {
        const patientWithSameRut =
          await this.patientRepository.findOneByRutExcludingId(dto.rut, id);
        if (patientWithSameRut) {
          throw new HttpException('Ya existe otro paciente con este RUT', 400);
        }
      }

      const updatedPatient = await this.patientRepository.updateByIdWithRelations(
        id,
        dto,
      );
      return {
        message: 'Paciente actualizado exitosamente',
        patient: PatientMapper.toResponse(updatedPatient),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error al actualizar el paciente: ' + error.message,
        500,
      );
    }
  }
}
