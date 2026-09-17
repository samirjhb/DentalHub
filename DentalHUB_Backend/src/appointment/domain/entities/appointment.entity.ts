import { AppointmentStatus } from './appointment-status.enum';

export class Appointment {
  constructor(
    public readonly _id: unknown,
    public patient: unknown,
    public dentist: unknown,
    public startAt: Date,
    public endAt: Date,
    public durationMinutes: number,
    public status: AppointmentStatus,
    public reason: string,
    public observations?: string,
    public clinicalRecord?: unknown,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
