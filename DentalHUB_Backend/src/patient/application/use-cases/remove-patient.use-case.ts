import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PatientRepository } from '../../domain/repositories/patient.repository';
import { ClinicalRecordRepository } from '../../../clinical-record/domain/repositories/clinical-record.repository';
import { AppointmentRepository } from '../../../appointment/domain/repositories/appointment.repository';
import { OdontogramRepository } from '../../../odontogram/domain/repositories/odontogram.repository';

@Injectable()
export class RemovePatientUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly clinicalRecordRepository: ClinicalRecordRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly odontogramRepository: OdontogramRepository,
  ) {}

  async execute(id: string) {
    try {
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
      }

      const blockers: string[] = [];

      const clinicalRecords = await this.clinicalRecordRepository.findByPatient(id);
      if (clinicalRecords.length > 0) {
        blockers.push('fichas clínicas');
      }

      const appointments = await this.appointmentRepository.findAll({ patient: id });
      if (appointments.length > 0) {
        blockers.push('citas');
      }

      const odontogram = await this.odontogramRepository.findByPatientId(id);
      if (odontogram) {
        blockers.push('odontograma');
      }

      if (blockers.length > 0) {
        throw new ConflictException(
          `No se puede eliminar el paciente porque tiene ${blockers.join(', ')} asociados`,
        );
      }

      await this.patientRepository.deleteById(id);
      return {
        message: 'Paciente eliminado exitosamente',
        patientId: id,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        'Error al eliminar el paciente: ' + error.message,
        500,
      );
    }
  }
}
