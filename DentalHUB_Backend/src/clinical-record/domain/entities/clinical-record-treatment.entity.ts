export class ClinicalRecordTreatment {
  constructor(
    public diagnosis: string,
    public toothNumber: string,
    public treatment: string,
    public price: number,
    public status: string = 'Pendiente',
    public deposit: number = 0,
    public appointmentDate?: Date,
    public observations?: string,
  ) {}
}
