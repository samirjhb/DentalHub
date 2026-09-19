import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MyClinicalTreatmentSummary {
  clinicalRecordId: string;
  toothNumber: string;
  treatment: string;
  diagnosis: string;
  price: number;
  deposit: number;
  status: string;
  appointmentDate?: string;
  pendingBalance: number;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá.
@Injectable({
  providedIn: 'root',
})
export class PatientPortalService {
  constructor(private http: HttpClient) {}

  async getMyClinicalSummary(): Promise<MyClinicalTreatmentSummary[]> {
    const response = await firstValueFrom(
      this.http.get<{ treatments: MyClinicalTreatmentSummary[] }>(
        `${environment.apiUrl}/clinical-record/me/summary`,
      ),
    );
    return response.treatments;
  }
}
