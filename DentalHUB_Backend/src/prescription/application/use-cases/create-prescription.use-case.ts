import { Injectable, NotFoundException } from '@nestjs/common';
import { PrescriptionRepository } from '../../domain/repositories/prescription.repository';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { PrescriptionMapper } from '../mappers/prescription.mapper';

@Injectable()
export class CreatePrescriptionUseCase {
  constructor(private readonly repository: PrescriptionRepository) {}

  async execute(dto: CreatePrescriptionDto) {
    const patientExists = await this.repository.verifyPatientExists(dto.patient);
    if (!patientExists) {
      throw new NotFoundException(`Paciente con ID ${dto.patient} no encontrado`);
    }

    const dentistExists = await this.repository.verifyDentistExists(dto.dentist);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${dto.dentist} no encontrado`);
    }

    if (dto.clinicalRecord) {
      const clinicalRecordExists = await this.repository.verifyClinicalRecordExists(
        dto.clinicalRecord,
      );
      if (!clinicalRecordExists) {
        throw new NotFoundException(
          `Ficha clínica con ID ${dto.clinicalRecord} no encontrada`,
        );
      }
    }

    const created = await this.repository.create({
      patient: dto.patient,
      dentist: dto.dentist,
      medications: dto.medications,
      clinicalRecord: dto.clinicalRecord,
      observations: dto.observations,
    });
    return PrescriptionMapper.toResponse(created);
  }
}
