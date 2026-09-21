import { DentistLookupPort, DentistLookupResult } from '../../domain/ports/dentist-lookup.port';

export class InMemoryDentistLookup extends DentistLookupPort {
  private dentists = new Map<string, DentistLookupResult>();

  seed(dentistId: string, data: DentistLookupResult): void {
    this.dentists.set(dentistId, data);
  }

  async findById(dentistId: string): Promise<DentistLookupResult | null> {
    return this.dentists.get(dentistId) ?? null;
  }
}
