import {
  AppointmentRepository,
  CreateAppointmentData,
  FindAllAppointmentsFilter,
} from '../../domain/repositories/appointment.repository';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentStatus } from '../../domain/entities/appointment-status.enum';

export class InMemoryAppointmentRepository extends AppointmentRepository {
  private appointments: Appointment[] = [];
  private existingPatientIds = new Set<string>();
  private existingDentistIds = new Set<string>();
  private nextId = 1;

  // Helpers de test, no forman parte del puerto real.
  seedPatient(patientId: string): void {
    this.existingPatientIds.add(patientId);
  }

  seedDentist(dentistId: string): void {
    this.existingDentistIds.add(dentistId);
  }

  async verifyPatientExists(patientId: string): Promise<boolean> {
    return this.existingPatientIds.has(patientId);
  }

  async verifyDentistExists(dentistId: string): Promise<boolean> {
    return this.existingDentistIds.has(dentistId);
  }

  async findOverlapping(
    dentistId: string,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    return this.appointments.some(
      (a) =>
        a.dentist === dentistId &&
        a.status !== AppointmentStatus.CANCELADA &&
        String(a._id) !== excludeAppointmentId &&
        a.startAt < endAt &&
        a.endAt > startAt,
    );
  }

  async create(data: CreateAppointmentData): Promise<Appointment> {
    const appointment = new Appointment(
      String(this.nextId++),
      data.patient,
      data.dentist,
      data.startAt,
      data.endAt,
      data.durationMinutes,
      AppointmentStatus.PENDIENTE,
      data.reason,
      data.observations,
      undefined,
      null,
      new Date(),
      new Date(),
    );
    this.appointments.push(appointment);
    return appointment;
  }

  async findAll(
    filter: FindAllAppointmentsFilter,
  ): Promise<Appointment[]> {
    return this.appointments.filter((a) => {
      if (filter.dentist && a.dentist !== filter.dentist) return false;
      if (filter.patient && a.patient !== filter.patient) return false;
      if (filter.status && a.status !== filter.status) return false;
      if (filter.startDate && a.startAt < filter.startDate) return false;
      if (filter.endDate && a.startAt > filter.endDate) return false;
      return true;
    });
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => String(a._id) === id) ?? null;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment | null> {
    const appointment = await this.findById(id);
    if (!appointment) return null;
    appointment.status = status;
    return appointment;
  }

  async reschedule(
    id: string,
    startAt: Date,
    endAt: Date,
    durationMinutes: number,
  ): Promise<Appointment | null> {
    const appointment = await this.findById(id);
    if (!appointment) return null;
    appointment.startAt = startAt;
    appointment.endAt = endAt;
    appointment.durationMinutes = durationMinutes;
    return appointment;
  }

  async findDueForReminder(windowStart: Date, windowEnd: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (a) =>
        a.status !== AppointmentStatus.CANCELADA &&
        !a.reminderSentAt &&
        a.startAt >= windowStart &&
        a.startAt < windowEnd,
    );
  }

  async markReminderSent(id: string): Promise<void> {
    const appointment = await this.findById(id);
    if (appointment) appointment.reminderSentAt = new Date();
  }
}
