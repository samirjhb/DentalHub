import { HttpException, Injectable } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { PatientMapper } from '../mappers/patient.mapper';

@Injectable()
export class FindAllPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute() {
    try {
      const patients = await this.patientRepository.findAllWithRelations();
      return {
        message: 'Pacientes encontrados',
        patients: patients.map((patient) => PatientMapper.toResponse(patient)),
      };
    } catch (error) {
      throw new HttpException(
        'Error al buscar pacientes: ' + error.message,
        500,
      );
    }
  }
}
