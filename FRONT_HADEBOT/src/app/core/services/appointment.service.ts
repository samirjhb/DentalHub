import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export type AppointmentStatus =
  | 'Pendiente'
  | 'Confirmada'
  | 'En atención'
  | 'Finalizada'
  | 'Cancelada'
  | 'No asistió';

export interface Appointment {
  _id: string;
  patient: string;
  dentist: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  observations?: string;
  clinicalRecord?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  patient: string;
  dentist: string;
  startAt: string;
  durationMinutes?: number;
  reason: string;
  observations?: string;
}

export interface RescheduleAppointmentDto {
  startAt: string;
  durationMinutes?: number;
}

export interface AppointmentFilter {
  dentist?: string;
  patient?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá.
@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  constructor(private http: HttpClient) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    return await firstValueFrom(
      this.http.post<Appointment>(`${environment.apiUrl}/appointment`, dto),
    );
  }

  async getAll(filter: AppointmentFilter = {}): Promise<Appointment[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    const response = await firstValueFrom(
      this.http.get<{ appointments: Appointment[] }>(
        `${environment.apiUrl}/appointment`,
        { params },
      ),
    );
    return response.appointments;
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    return await firstValueFrom(
      this.http.patch<Appointment>(
        `${environment.apiUrl}/appointment/${id}/status`,
        { status },
      ),
    );
  }

  async reschedule(
    id: string,
    dto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return await firstValueFrom(
      this.http.patch<Appointment>(
        `${environment.apiUrl}/appointment/${id}/reschedule`,
        dto,
      ),
    );
  }
}
