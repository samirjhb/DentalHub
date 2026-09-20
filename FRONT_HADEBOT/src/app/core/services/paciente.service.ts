import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedResponse } from 'src/app/core/models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  constructor(private http: HttpClient) { }

  async createPaciente(paciente: any) {
    console.log('PacienteService: Creando nuevo paciente');
    console.log('PacienteService: Datos a enviar:', paciente);
    
    // Obtener el token de localStorage o sessionStorage
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
      console.log('PacienteService: Token obtenido de sessionStorage');
    } else {
      console.log('PacienteService: Token obtenido de localStorage');
    }
    
    console.log('PacienteService: URL de creación:', `${environment.apiUrl}/patient`);
    
    return await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/patient`, paciente, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  async getPacientes() {
    const token = sessionStorage.getItem('token');
    return await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/patient`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  // Paginación server-side real, para la tabla de Pacientes — a diferencia
  // de getPacientes() (usado por los selectores de paciente en otras
  // pantallas), acá SÍ mandamos page/limit y el backend responde el sobre
  // { data, total, page, limit, totalPages } en vez del { message, patients }.
  async getPacientesPage(page: number, limit: number) {
    const token = sessionStorage.getItem('token');
    return await firstValueFrom(
      this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/patient`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      }),
    );
  }

  async deletePaciente(id: string) {
    const token = sessionStorage.getItem('token');
    return await firstValueFrom(this.http.delete<any>(`${environment.apiUrl}/patient/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  async updatePaciente(id: string, paciente: any) {
    // Obtener el token de sessionStorage o localStorage
    let token = sessionStorage.getItem('token');
    if (!token) {
      token = localStorage.getItem('token');
      console.log('PacienteService: Token obtenido de localStorage');
    } else {
      console.log('PacienteService: Token obtenido de sessionStorage');
    }
        
    return await firstValueFrom(this.http.patch<any>(`${environment.apiUrl}/patient/${id}`, paciente, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }
  
  // El AuthInterceptor global ya adjunta el Bearer token — a diferencia de
  // los métodos de arriba, estos dos no lo adjuntan a mano.
  async getPortalAccess(patientId: string): Promise<{ linked: boolean; email?: string }> {
    return await firstValueFrom(
      this.http.get<{ linked: boolean; email?: string }>(
        `${environment.apiUrl}/auth/patient-access/${patientId}`,
      ),
    );
  }

  async grantPortalAccess(dto: { patientId: string; email: string; password?: string }) {
    return await firstValueFrom(
      this.http.post<any>(`${environment.apiUrl}/auth/patient-access`, dto),
    );
  }

  async getPacienteById(id: string) {
    // Obtener el token de sessionStorage o localStorage
    let token = sessionStorage.getItem('token');
    if (!token) {
      token = localStorage.getItem('token');
      console.log('PacienteService: Token obtenido de localStorage');
    } else {
      console.log('PacienteService: Token obtenido de sessionStorage');
    }
    
    const paciente = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/patient/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
    return paciente.patient;
  }
}
