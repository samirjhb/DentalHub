import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../entities/appointment-status.enum';

export interface CreateAppointmentData {
  patient: string;
  dentist: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  reason: string;
  observations?: string;
}

export interface FindAllAppointmentsFilter {
  dentist?: string;
  patient?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export abstract class AppointmentRepository {
  // Backed por los mismos tokens independientes 'Patient'/'Auth' que ya usan
  // clinical-record/odontogram — no se acopla a los repositorios de esos módulos.
  abstract verifyPatientExists(patientId: string): Promise<boolean>;
  // Además de existir, confirma que el usuario tiene rol DENTIST.
  abstract verifyDentistExists(dentistId: string): Promise<boolean>;

  abstract findOverlapping(
    dentistId: string,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean>;

  abstract create(data: CreateAppointmentData): Promise<Appointment>;
  abstract findAll(filter: FindAllAppointmentsFilter): Promise<Appointment[]>;
  abstract findById(id: string): Promise<Appointment | null>;
  abstract updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment | null>;
  abstract reschedule(
    id: string,
    startAt: Date,
    endAt: Date,
    durationMinutes: number,
  ): Promise<Appointment | null>;

  // Citas próximas a las que aún no se les envió el recordatorio por email
  // (ver appointment-reminder module) — startAt dentro de [windowStart, windowEnd).
  abstract findDueForReminder(
    windowStart: Date,
    windowEnd: Date,
  ): Promise<Appointment[]>;
  abstract markReminderSent(id: string): Promise<void>;
}
