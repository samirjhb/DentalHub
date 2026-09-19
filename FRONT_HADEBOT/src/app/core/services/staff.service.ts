import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface StaffMember {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export interface CreateStaffData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateStaffData {
  name?: string;
  role?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá.
@Injectable({
  providedIn: 'root',
})
export class StaffService {
  constructor(private http: HttpClient) {}

  async getDentistas(): Promise<StaffMember[]> {
    const response = await firstValueFrom(
      this.http.get<{ staff: StaffMember[] }>(
        `${environment.apiUrl}/auth/staff`,
        { params: { role: 'DENTIST' } },
      ),
    );
    return response.staff;
  }

  // Sin filtro de rol: /auth/staff devuelve TODAS las cuentas (incluye
  // PATIENT), el llamador filtra qué mostrar como "personal".
  async getAllStaff(): Promise<StaffMember[]> {
    const response = await firstValueFrom(
      this.http.get<{ staff: StaffMember[] }>(`${environment.apiUrl}/auth/staff`),
    );
    return response.staff;
  }

  async createStaff(data: CreateStaffData): Promise<StaffMember> {
    const response = await firstValueFrom(
      this.http.post<{ user: StaffMember }>(`${environment.apiUrl}/auth/staff`, data),
    );
    return response.user;
  }

  async updateStaff(id: string, data: UpdateStaffData): Promise<StaffMember> {
    const response = await firstValueFrom(
      this.http.patch<{ user: StaffMember }>(`${environment.apiUrl}/auth/staff/${id}`, data),
    );
    return response.user;
  }
}
