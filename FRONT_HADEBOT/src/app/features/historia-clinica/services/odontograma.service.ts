import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export type ToothStatus =
  | 'Sano'
  | 'Cariado'
  | 'Obturado'
  | 'Ausente'
  | 'Corona'
  | 'Endodoncia'
  | 'Implante'
  | 'Fracturado'
  | 'Sellante'
  | 'ExtraccionIndicada';

export interface ToothState {
  toothNumber: string;
  status: ToothStatus;
  observations?: string;
  updatedAt?: Date;
}

export interface Odontogram {
  _id: string;
  patient: string;
  teeth: ToothState[];
  generalObservations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateToothDto {
  status: ToothStatus;
  observations?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá.
@Injectable({
  providedIn: 'root',
})
export class OdontogramaService {
  constructor(private http: HttpClient) {}

  async createOdontograma(patientId: string): Promise<Odontogram> {
    return await firstValueFrom(
      this.http.post<Odontogram>(`${environment.apiUrl}/odontogram`, {
        patient: patientId,
      }),
    );
  }

  async getByPatient(patientId: string): Promise<Odontogram> {
    return await firstValueFrom(
      this.http.get<Odontogram>(
        `${environment.apiUrl}/odontogram/patient/${patientId}`,
      ),
    );
  }

  async updateTooth(
    patientId: string,
    toothNumber: string,
    dto: UpdateToothDto,
  ): Promise<Odontogram> {
    return await firstValueFrom(
      this.http.patch<Odontogram>(
        `${environment.apiUrl}/odontogram/patient/${patientId}/teeth/${toothNumber}`,
        dto,
      ),
    );
  }

  async updateGeneralObservations(
    patientId: string,
    observations: string,
  ): Promise<Odontogram> {
    return await firstValueFrom(
      this.http.patch<Odontogram>(
        `${environment.apiUrl}/odontogram/patient/${patientId}`,
        { observations },
      ),
    );
  }
}
