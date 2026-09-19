import { ClinicalRecord } from '../../domain/entities/clinical-record.entity';

// Vista recortada para el Portal de Pacientes: omite `radiography` y
// `observations` (notas internas del staff) — el paciente solo ve el estado
// comercial/clínico básico de cada tratamiento, no el detalle clínico interno.
export class PatientClinicalSummaryMapper {
  static toResponse(records: ClinicalRecord[]) {
    return {
      treatments: records.flatMap((record) =>
        record.treatments.map((t) => ({
          clinicalRecordId: record._id,
          toothNumber: t.toothNumber,
          treatment: t.treatment,
          diagnosis: t.diagnosis,
          price: t.price,
          deposit: t.deposit,
          status: t.status,
          appointmentDate: t.appointmentDate,
          pendingBalance: t.price - t.deposit,
        })),
      ),
    };
  }
}
