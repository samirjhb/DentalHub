export interface DentistLookupResult {
  name: string;
}

// Mismo criterio que PatientLookupPort: AuthModule tampoco exporta su
// repositorio hoy.
export abstract class DentistLookupPort {
  abstract findById(dentistId: string): Promise<DentistLookupResult | null>;
}
