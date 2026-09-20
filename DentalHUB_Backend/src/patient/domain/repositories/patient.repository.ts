import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../application/dto/update-patient.dto';

export abstract class PatientRepository {
  abstract findOneByRut(rut: string): Promise<Patient | null>;
  abstract findOneByRutExcludingId(
    rut: string,
    excludeId: string,
  ): Promise<Patient | null>;
  abstract create(dto: CreatePatientDto): Promise<Patient>;
  abstract findAllWithRelations(
    skip?: number,
    limit?: number,
  ): Promise<Patient[]>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Patient | null>;
  abstract findByIdWithRelations(id: string): Promise<Patient | null>;
  abstract updateByIdWithRelations(
    id: string,
    dto: UpdatePatientDto,
  ): Promise<Patient | null>;
  abstract deleteById(id: string): Promise<void>;
}
