import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

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

export interface ReportsDateRangeFilter {
  startDate?: string;
  endDate?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient. Feature-scoped (único consumidor confirmado: Reportes).
@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  constructor(private http: HttpClient) {}

  private buildParams(filter: ReportsDateRangeFilter): Record<string, string> {
    const params: Record<string, string> = {};
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    return params;
  }

  async getRevenue(filter: ReportsDateRangeFilter): Promise<RevenueSummary> {
    return await firstValueFrom(
      this.http.get<RevenueSummary>(`${environment.apiUrl}/reports/revenue`, {
        params: this.buildParams(filter),
      }),
    );
  }

  async getTreatments(filter: ReportsDateRangeFilter): Promise<TreatmentsSummary> {
    return await firstValueFrom(
      this.http.get<TreatmentsSummary>(`${environment.apiUrl}/reports/treatments`, {
        params: this.buildParams(filter),
      }),
    );
  }

  async getAppointments(filter: ReportsDateRangeFilter): Promise<AppointmentsSummary> {
    return await firstValueFrom(
      this.http.get<AppointmentsSummary>(`${environment.apiUrl}/reports/appointments`, {
        params: this.buildParams(filter),
      }),
    );
  }

  async getNewPatients(filter: ReportsDateRangeFilter): Promise<{ count: number }> {
    return await firstValueFrom(
      this.http.get<{ count: number }>(`${environment.apiUrl}/reports/patients/new`, {
        params: this.buildParams(filter),
      }),
    );
  }
}
