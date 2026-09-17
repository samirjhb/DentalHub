import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { PatientMapper } from '../mappers/patient.mapper';

@Injectable()
export class FindPatientByIdUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: string) {
    try {
      const patient = await this.patientRepository.findByIdWithRelations(id);
      if (!patient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }
      return {
        message: 'Paciente encontrado',
        patient: PatientMapper.toResponse(patient),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error al buscar el paciente: ' + error.message,
        500,
      );
    }
  }
}
