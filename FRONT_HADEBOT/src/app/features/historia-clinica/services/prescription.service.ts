import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionPatientRef {
  _id: string;
  name: string;
}

export interface PrescriptionDentistRef {
  _id: string;
  name: string;
  email: string;
}

export interface Prescription {
  _id: string;
  // El backend popula patient/dentist al listar (GET), pero devuelve el ID
  // plano tal cual se envió al crear (POST) — de ahí la unión de tipos.
  patient: string | PrescriptionPatientRef;
  dentist: string | PrescriptionDentistRef;
  clinicalRecord?: string;
  medications: Medication[];
  issuedAt: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionDto {
  patient: string;
  dentist: string;
  clinicalRecord?: string;
  medications: Medication[];
  observations?: string;
}

export interface PrescriptionFilter {
  patient?: string;
  dentist?: string;
  clinicalRecord?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá. Feature-scoped
// (único consumidor confirmado: el tab de Prescripciones en Historia Clínica).
@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  constructor(private http: HttpClient) {}

  async createPrescription(dto: CreatePrescriptionDto): Promise<Prescription> {
    return await firstValueFrom(
      this.http.post<Prescription>(`${environment.apiUrl}/prescriptions`, dto),
    );
  }

  async getPrescriptions(filter: PrescriptionFilter = {}): Promise<Prescription[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return await firstValueFrom(
      this.http.get<Prescription[]>(`${environment.apiUrl}/prescriptions`, { params }),
    );
  }
}
