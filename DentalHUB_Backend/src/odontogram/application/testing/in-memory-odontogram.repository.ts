import { OdontogramRepository } from '../../domain/repositories/odontogram.repository';
import { Odontogram } from '../../domain/entities/odontogram.entity';
import { ToothState, ToothStatus } from '../../domain/entities/tooth-state.entity';

export class InMemoryOdontogramRepository extends OdontogramRepository {
  private odontograms: Odontogram[] = [];
  private existingPatientIds = new Set<string>();
  private nextId = 1;

  // Helper de test, no forma parte del puerto real.
  seedPatient(patientId: string): void {
    this.existingPatientIds.add(patientId);
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    return this.existingPatientIds.has(patientId);
  }

  async findByPatientId(patientId: string): Promise<Odontogram | null> {
    return this.odontograms.find((o) => o.patient === patientId) ?? null;
  }

  async create(patientId: string, teeth: ToothState[]): Promise<Odontogram> {
    const odontogram = new Odontogram(
      String(this.nextId++),
      patientId,
      teeth.map(
        (t) => new ToothState(t.toothNumber, t.status, t.observations),
      ),
      undefined,
      new Date(),
      new Date(),
    );
    this.odontograms.push(odontogram);
    return odontogram;
  }

  async updateTooth(
    patientId: string,
    toothNumber: string,
    status: ToothStatus,
    observations?: string,
  ): Promise<Odontogram | null> {
    const odontogram = await this.findByPatientId(patientId);
    if (!odontogram) return null;
    const tooth = odontogram.teeth.find((t) => t.toothNumber === toothNumber);
    if (!tooth) return null;
    tooth.status = status;
    tooth.observations = observations;
    tooth.updatedAt = new Date();
    return odontogram;
  }

  async updateGeneralObservations(
    patientId: string,
    observations: string,
  ): Promise<Odontogram | null> {
    const odontogram = await this.findByPatientId(patientId);
    if (!odontogram) return null;
    odontogram.generalObservations = observations;
    return odontogram;
  }
}
