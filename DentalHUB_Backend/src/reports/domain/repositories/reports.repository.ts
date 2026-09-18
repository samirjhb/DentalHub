export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface RevenueByMethod {
  EFECTIVO: number;
  TARJETA: number;
  TRANSFERENCIA: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  byMethod: RevenueByMethod;
}

export interface TreatmentsSummary {
  byStatus: Record<string, number>;
  total: number;
}

export interface AppointmentsByDentist {
  dentist: string;
  count: number;
}

export interface AppointmentsSummary {
  byStatus: Record<string, number>;
  byDentist: AppointmentsByDentist[];
  total: number;
}

// Puerto de solo lectura, sin colección propia — mismo espíritu que
// CalculateTotalClinicBalanceUseCase de billing, pero para el módulo
// completo. Cada método lee de una colección AJENA vía un binding
// independiente (mismo patrón de acoplamiento cruzado ya usado 3 veces:
// clinical-record→Patient, appointment→Patient+Auth, billing→ClinicalRecord+Auth).
export abstract class ReportsRepository {
  abstract getRevenueSummary(filter: DateRangeFilter): Promise<RevenueSummary>;
  abstract getTreatmentsSummary(filter: DateRangeFilter): Promise<TreatmentsSummary>;
  abstract getAppointmentsSummary(
    filter: DateRangeFilter,
  ): Promise<AppointmentsSummary>;
  abstract getNewPatientsCount(filter: DateRangeFilter): Promise<{ count: number }>;
}
