import { PaymentMethod } from './payment-method.enum';

export class Payment {
  constructor(
    public readonly _id: unknown,
    public clinicalRecord: unknown,
    public treatmentIndex: number,
    // Derivado por el backend desde clinicalRecord.patient al registrar el
    // pago — nunca se acepta del cliente, evita que quede desincronizado.
    public patient: unknown,
    public amount: number,
    public method: PaymentMethod,
    public registeredBy: unknown,
    public paidAt: Date,
    public observations?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
