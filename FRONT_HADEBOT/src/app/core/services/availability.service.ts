import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ScheduleBlock {
  dayOfWeek: number; // 0 = domingo ... 6 = sábado
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface WeeklySchedule {
  dentist: string;
  blocks: ScheduleBlock[];
}

export interface DateException {
  _id: string;
  dentist: string;
  date: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface CreateDateExceptionDto {
  date: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá.
@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  constructor(private http: HttpClient) {}

  async getAvailableSlots(
    dentistId: string,
    date: string,
    durationMinutes = 60,
  ): Promise<string[]> {
    const response = await firstValueFrom(
      this.http.get<{ slots: string[] }>(
        `${environment.apiUrl}/availability/available-slots`,
        { params: { dentistId, date, durationMinutes } },
      ),
    );
    return response.slots;
  }

  async getSchedule(dentistId: string): Promise<WeeklySchedule> {
    return await firstValueFrom(
      this.http.get<WeeklySchedule>(
        `${environment.apiUrl}/availability/schedule/${dentistId}`,
      ),
    );
  }

  async updateSchedule(
    dentistId: string,
    blocks: ScheduleBlock[],
  ): Promise<WeeklySchedule> {
    return await firstValueFrom(
      this.http.put<WeeklySchedule>(
        `${environment.apiUrl}/availability/schedule/${dentistId}`,
        { blocks },
      ),
    );
  }

  async listExceptions(dentistId: string): Promise<DateException[]> {
    return await firstValueFrom(
      this.http.get<DateException[]>(
        `${environment.apiUrl}/availability/exceptions/${dentistId}`,
      ),
    );
  }

  async addException(
    dentistId: string,
    exception: CreateDateExceptionDto,
  ): Promise<DateException> {
    return await firstValueFrom(
      this.http.post<DateException>(
        `${environment.apiUrl}/availability/exceptions/${dentistId}`,
        exception,
      ),
    );
  }

  async deleteException(dentistId: string, exceptionId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${environment.apiUrl}/availability/exceptions/${dentistId}/${exceptionId}`,
      ),
    );
  }
}
