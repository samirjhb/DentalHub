export class Patient {
  constructor(
    public readonly _id: unknown, // ObjectId de Mongoose en runtime; sin tipar fuerte para no acoplar el dominio a Mongoose
    public name: string,
    public rut: string,
    public cel: number,
    public email: string,
    public record: string | undefined,
    public birthDate: Date,
    public evaluations: unknown[] = [],
    public clinicalRecords: unknown[] = [],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
