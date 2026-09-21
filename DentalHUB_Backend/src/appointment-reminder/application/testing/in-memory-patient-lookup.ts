import { PatientLookupPort, PatientLookupResult } from '../../domain/ports/patient-lookup.port';

export class InMemoryPatientLookup extends PatientLookupPort {
  private patients = new Map<string, PatientLookupResult>();

  seed(patientId: string, data: PatientLookupResult): void {
    this.patients.set(patientId, data);
  }

  async findById(patientId: string): Promise<PatientLookupResult | null> {
    return this.patients.get(patientId) ?? null;
  }
}
