import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interfaces según la documentación actualizada

// Subesquema de Tratamiento Dental
export interface DentalTreatment {
  diagnosis: string;
  radiography?: string;
  toothNumber: number;
  treatment: string;
  price: number;
  status: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
  deposit: number;
  appointmentDate?: Date;
  observations?: string;
}

// Esquema principal de Ficha Clínica
export interface ClinicalRecord {
  _id: string;
  patient: any; // Objeto paciente completo
  treatments: DentalTreatment[];
  attachments?: string[];
  dentist: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para operaciones
export interface CreateClinicalRecordDto {
  patient: string;
  treatments: {
    diagnosis: string;
    radiography?: string;
    toothNumber: number;
    treatment: string;
    price: number;
    status?: string;
    deposit?: number;
    appointmentDate?: Date;
    observations?: string;
  }[];
  attachments?: string[];
  dentist: string;
}

export interface AddTreatmentDto {
  diagnosis: string;
  radiography?: string;
  toothNumber: number;
  treatment: string;
  price: number;
  status?: string;
  deposit?: number;
  appointmentDate?: Date;
  observations?: string;
}

export interface UpdateStatusDto {
  status: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
}

export interface AddDepositDto {
  amount: number;
}

export interface UpdateAppointmentDateDto {
  date: Date;
}

export interface FilterClinicalRecordDto {
  patient?: string;
  dentist?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FichaClinicaService {

  constructor(private http: HttpClient) { }

  private getToken(): string | null {
    // Obtener el token de localStorage o sessionStorage
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    return token;
  }

  async createFichaClinica(ficha: CreateClinicalRecordDto) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.post<ClinicalRecord>(`${environment.apiUrl}/clinical-record`, ficha, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  async getFichasClinicas(patientId?: string) {
    const token = this.getToken();
    let url = `${environment.apiUrl}/clinical-record`;
    
    // Si hay un ID de paciente, usar el endpoint de filtrado
    if (patientId) {
      url = `${environment.apiUrl}/clinical-record/filter?patient=${patientId}`;
    }
    
    return await firstValueFrom(this.http.get<ClinicalRecord[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  async deleteFichaClinica(id: string) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.delete<any>(`${environment.apiUrl}/clinical-record/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  async updateFichaClinica(id: string, ficha: Partial<CreateClinicalRecordDto>) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.patch<ClinicalRecord>(`${environment.apiUrl}/clinical-record/${id}`, ficha, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }
  
  async getFichaClinicaById(id: string) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.get<ClinicalRecord>(`${environment.apiUrl}/clinical-record/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }

  // Métodos específicos según la documentación actualizada
  
  // Filtrar fichas clínicas por diferentes criterios
  async filterFichasClinicas(filterData: FilterClinicalRecordDto) {
    const token = this.getToken();
    
    // Construir la URL con los parámetros de filtro
    let url = `${environment.apiUrl}/clinical-record/filter?`;
    const params = new URLSearchParams();
    
    if (filterData.patient) params.append('patient', filterData.patient);
    if (filterData.dentist) params.append('dentist', filterData.dentist);
    if (filterData.status) params.append('status', filterData.status);
    if (filterData.startDate) params.append('startDate', filterData.startDate.toISOString());
    if (filterData.endDate) params.append('endDate', filterData.endDate.toISOString());
    
    url += params.toString();
    
    return await firstValueFrom(this.http.get<ClinicalRecord[]>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }));
  }
  
  // Agregar un nuevo tratamiento a una ficha clínica existente
  async addTreatment(id: string, treatmentData: AddTreatmentDto) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.post<ClinicalRecord>(
      `${environment.apiUrl}/clinical-record/${id}/treatments`, 
      treatmentData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Eliminar un tratamiento específico
  async deleteTreatment(id: string, treatmentIndex: number) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.delete<ClinicalRecord>(
      `${environment.apiUrl}/clinical-record/${id}/treatments/${treatmentIndex}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Actualizar el estado de un tratamiento específico
  async updateTreatmentStatus(id: string, treatmentIndex: number, statusData: UpdateStatusDto) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.patch<ClinicalRecord>(
      `${environment.apiUrl}/clinical-record/${id}/treatments/${treatmentIndex}/status`, 
      statusData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Registrar un abono para un tratamiento específico
  async addTreatmentDeposit(id: string, treatmentIndex: number, depositData: AddDepositDto) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.post<ClinicalRecord>(
      `${environment.apiUrl}/clinical-record/${id}/treatments/${treatmentIndex}/deposit`, 
      depositData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Actualizar la fecha de cita de un tratamiento específico
  async updateTreatmentAppointmentDate(id: string, treatmentIndex: number, dateData: UpdateAppointmentDateDto) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.patch<ClinicalRecord>(
      `${environment.apiUrl}/clinical-record/${id}/treatments/${treatmentIndex}/appointment-date`, 
      dateData, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Obtener el saldo de un tratamiento específico
  async getTreatmentBalance(id: string, treatmentIndex: number) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.get<{balance: number, percentagePaid: number}>(
      `${environment.apiUrl}/clinical-record/${id}/treatments/${treatmentIndex}/balance`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
  
  // Obtener el saldo total de la ficha clínica
  async getClinicalRecordBalance(id: string) {
    const token = this.getToken();
    
    return await firstValueFrom(this.http.get<{totalBalance: number, totalPercentagePaid: number}>(
      `${environment.apiUrl}/clinical-record/${id}/balance`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    ));
  }
}
