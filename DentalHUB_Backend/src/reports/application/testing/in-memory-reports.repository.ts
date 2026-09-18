import {
  ReportsRepository,
  DateRangeFilter,
  RevenueSummary,
  TreatmentsSummary,
  AppointmentsSummary,
} from '../../domain/repositories/reports.repository';

interface SeedPayment {
  amount: number;
  method: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  paidAt: Date;
}

interface SeedTreatment {
  status: string;
  createdAt: Date;
}

interface SeedAppointment {
  status: string;
  dentist: string;
  startAt: Date;
}

interface SeedPatient {
  createdAt: Date;
}

// Fake del puerto — agrega en memoria sobre datos sembrados, mismo espíritu
// que un `find()` con filtro de fecha + agregación en memoria del repositorio
// Mongo real, sin depender de Mongo/Nest.
export class InMemoryReportsRepository extends ReportsRepository {
  private payments: SeedPayment[] = [];
  private treatments: SeedTreatment[] = [];
  private appointments: SeedAppointment[] = [];
  private patients: SeedPatient[] = [];

  seedPayment(payment: SeedPayment): void {
    this.payments.push(payment);
  }

  seedTreatment(treatment: SeedTreatment): void {
    this.treatments.push(treatment);
  }

  seedAppointment(appointment: SeedAppointment): void {
    this.appointments.push(appointment);
  }

  seedPatient(patient: SeedPatient): void {
    this.patients.push(patient);
  }

  private inRange(date: Date, filter: DateRangeFilter): boolean {
    if (filter.startDate && date < filter.startDate) return false;
    if (filter.endDate && date > filter.endDate) return false;
    return true;
  }

  async getRevenueSummary(filter: DateRangeFilter): Promise<RevenueSummary> {
    const byMethod = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
    let totalRevenue = 0;
    for (const payment of this.payments) {
      if (!this.inRange(payment.paidAt, filter)) continue;
      totalRevenue += payment.amount;
      byMethod[payment.method] += payment.amount;
    }
    return { totalRevenue, byMethod };
  }

  async getTreatmentsSummary(filter: DateRangeFilter): Promise<TreatmentsSummary> {
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const treatment of this.treatments) {
      if (!this.inRange(treatment.createdAt, filter)) continue;
      byStatus[treatment.status] = (byStatus[treatment.status] || 0) + 1;
      total++;
    }
    return { byStatus, total };
  }

  async getAppointmentsSummary(
    filter: DateRangeFilter,
  ): Promise<AppointmentsSummary> {
    const byStatus: Record<string, number> = {};
    const byDentistMap = new Map<string, number>();
    let total = 0;
    for (const appointment of this.appointments) {
      if (!this.inRange(appointment.startAt, filter)) continue;
      byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;
      byDentistMap.set(
        appointment.dentist,
        (byDentistMap.get(appointment.dentist) || 0) + 1,
      );
      total++;
    }
    const byDentist = Array.from(byDentistMap.entries()).map(
      ([dentist, count]) => ({ dentist, count }),
    );
    return { byStatus, byDentist, total };
  }

  async getNewPatientsCount(filter: DateRangeFilter): Promise<{ count: number }> {
    const count = this.patients.filter((p) => this.inRange(p.createdAt, filter)).length;
    return { count };
  }
}
