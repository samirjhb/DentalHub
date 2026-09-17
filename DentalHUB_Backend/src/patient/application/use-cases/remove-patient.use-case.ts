import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';

@Injectable()
export class RemovePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: string) {
    try {
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }

      await this.patientRepository.deleteById(id);
      return {
        message: 'Paciente eliminado exitosamente',
        patientId: id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Error al eliminar el paciente: ' + error.message,
        500,
      );
    }
  }
}
