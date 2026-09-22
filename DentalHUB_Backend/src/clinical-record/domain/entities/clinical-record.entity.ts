import { ClinicalRecordTreatment } from './clinical-record-treatment.entity';
import { ClinicalRecordAttachment } from './clinical-record-attachment.entity';

export class ClinicalRecord {
  constructor(
    public readonly _id: unknown,
    // Mongoose ObjectId sin poblar, o el sub-documento Patient completo cuando
    // la query usó .populate('patient') — deliberadamente sin tipar fuerte
    // (misma disciplina que Patient.evaluations/clinicalRecords), así el
    // mapper nunca tiene que reconstruir el JSON anidado del paciente a mano.
    public patient: unknown,
    public treatments: ClinicalRecordTreatment[],
    public dentist: string,
    public attachments?: ClinicalRecordAttachment[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly __v?: number,
  ) {}
}
