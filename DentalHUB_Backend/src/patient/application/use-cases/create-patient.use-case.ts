import { HttpException, Injectable } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { PatientMapper } from '../mappers/patient.mapper';

@Injectable()
export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(dto: CreatePatientDto) {
    try {
      const existingPatient = await this.patientRepository.findOneByRut(
        dto.rut,
      );
      if (existingPatient) {
        throw new HttpException('Ya existe un paciente con este RUT', 400);
      }

      const newPatient = await this.patientRepository.create(dto);
      return {
        message: 'Paciente registrado exitosamente',
        patient: PatientMapper.toResponse(newPatient),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error al registrar el paciente: ' + error.message,
        500,
      );
    }
  }
}
