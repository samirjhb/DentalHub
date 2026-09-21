export interface PatientLookupResult {
  name: string;
  email: string;
}

// Puerto mínimo (no el PatientRepository completo) porque PatientModule no
// exporta su repositorio hoy — ver la nota en appointment-reminder.module.ts.
export abstract class PatientLookupPort {
  abstract findById(patientId: string): Promise<PatientLookupResult | null>;
}
