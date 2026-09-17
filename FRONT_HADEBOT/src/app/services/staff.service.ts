import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface StaffMember {
  _id: string;
  email: string;
  name: string;
  role: string;
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
}
