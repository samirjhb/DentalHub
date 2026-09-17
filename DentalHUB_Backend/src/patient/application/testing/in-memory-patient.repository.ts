import { PatientRepository } from '../../domain/repositories/patient.repository';
import { Patient } from '../../domain/entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';

export class InMemoryPatientRepository extends PatientRepository {
  private patients: Patient[] = [];
  private nextId = 1;

  async findOneByRut(rut: string): Promise<Patient | null> {
    return this.patients.find((p) => p.rut === rut) ?? null;
  }

  async findOneByRutExcludingId(
    rut: string,
    excludeId: string,
  ): Promise<Patient | null> {
    return (
      this.patients.find((p) => p.rut === rut && p._id !== excludeId) ?? null
    );
  }

  async create(dto: CreatePatientDto): Promise<Patient> {
    const patient = new Patient(
      String(this.nextId++),
      dto.name,
      dto.rut,
      dto.cel,
      dto.email,
      dto.record,
      new Date(dto.birthDate),
      [],
      [],
      new Date(),
      new Date(),
    );
    this.patients.push(patient);
    return patient;
  }

  async findAllWithRelations(): Promise<Patient[]> {
    return this.patients;
  }

  async findById(id: string): Promise<Patient | null> {
    return this.patients.find((p) => p._id === id) ?? null;
  }

  async findByIdWithRelations(id: string): Promise<Patient | null> {
    return this.findById(id);
  }

  async updateByIdWithRelations(
    id: string,
    dto: UpdatePatientDto,
  ): Promise<Patient | null> {
    const patient = await this.findById(id);
    if (!patient) return null;
    Object.assign(patient, dto);
    return patient;
  }

  async deleteById(id: string): Promise<void> {
    this.patients = this.patients.filter((p) => p._id !== id);
  }
}
