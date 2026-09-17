import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../domain/repositories/billing.repository';

export interface PendingTreatmentRow {
  clinicalRecordId: unknown;
  treatmentIndex: number;
  treatment: string;
  toothNumber: string;
  price: number;
  deposit: number;
  pendingBalance: number;
  status: string;
}

// Vista de solo lo relacionado a dinero, pensada para roles financieros
// (RECEPTIONIST incluido) que no tienen acceso a `clinical-record` (que sí
// expone diagnóstico/radiografías/observaciones clínicas).
@Injectable()
export class FindPatientTreatmentsUseCase {
  constructor(private readonly repository: BillingRepository) {}

  async execute(patientId: string): Promise<PendingTreatmentRow[]> {
    const records = await this.repository.findClinicalRecordsByPatient(
      patientId,
    );

    const rows: PendingTreatmentRow[] = [];
    for (const record of records) {
      record.treatments.forEach((treatment, index) => {
        rows.push({
          clinicalRecordId: record._id,
          treatmentIndex: index,
          treatment: treatment.treatment,
          toothNumber: treatment.toothNumber,
          price: treatment.price,
          deposit: treatment.deposit || 0,
          pendingBalance: (treatment.price || 0) - (treatment.deposit || 0),
          status: treatment.status,
        });
      });
    }
    return rows;
  }
}
