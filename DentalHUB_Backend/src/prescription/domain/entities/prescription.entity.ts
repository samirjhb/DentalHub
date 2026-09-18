import { Medication } from './medication.entity';

export class Prescription {
  constructor(
    public readonly _id: unknown,
    public patient: unknown,
    public dentist: unknown,
    public medications: Medication[],
    public issuedAt: Date,
    public clinicalRecord?: unknown,
    public observations?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
