import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentMethod } from 'src/app/shared/components/dialogs/payment-dialog/payment-dialog.component';

export interface Payment {
  _id: string;
  clinicalRecord: string;
  treatmentIndex: number;
  patient: string;
  amount: number;
  method: PaymentMethod;
  registeredBy: string;
  paidAt: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPaymentDto {
  clinicalRecord: string;
  treatmentIndex: number;
  amount: number;
  method: PaymentMethod;
  registeredBy: string;
  observations?: string;
}

export interface RegisterPaymentResponse {
  payment: Payment;
  clinicalRecord: {
    _id: string;
    patient: string;
    dentist: string;
    attachments?: string[];
    treatments: {
      diagnosis: string;
      toothNumber: string;
      treatment: string;
      price: number;
      status: string;
      deposit: number;
      observations?: string;
    }[];
  };
}

export interface PaymentFilter {
  patient?: string;
  clinicalRecord?: string;
  startDate?: string;
  endDate?: string;
}

export interface Balance {
  totalPrice: number;
  totalPaid: number;
  pendingBalance: number;
  percentagePaid: number;
}

export interface PatientTreatmentRow {
  clinicalRecordId: string;
  treatmentIndex: number;
  treatment: string;
  toothNumber: string;
  price: number;
  deposit: number;
  pendingBalance: number;
  status: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient — no hace falta leerlo/adjuntarlo a mano acá. Vive en core/services/
// (no en features/billing/) porque lo consumen 3 features: Cobranza, Historia
// Clínica y Dashboard — mismo criterio que AppointmentService.
@Injectable({
  providedIn: 'root',
})
export class BillingService {
  constructor(private http: HttpClient) {}

  async registerPayment(
    dto: RegisterPaymentDto,
  ): Promise<RegisterPaymentResponse> {
    return await firstValueFrom(
      this.http.post<RegisterPaymentResponse>(
        `${environment.apiUrl}/billing/payments`,
        dto,
      ),
    );
  }

  async getPayments(filter: PaymentFilter = {}): Promise<Payment[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    const response = await firstValueFrom(
      this.http.get<{ payments: Payment[] }>(
        `${environment.apiUrl}/billing/payments`,
        { params },
      ),
    );
    return response.payments;
  }

  async getPatientBalance(patientId: string): Promise<Balance> {
    return await firstValueFrom(
      this.http.get<Balance>(
        `${environment.apiUrl}/billing/patients/${patientId}/balance`,
      ),
    );
  }

  async getPatientTreatments(patientId: string): Promise<PatientTreatmentRow[]> {
    return await firstValueFrom(
      this.http.get<PatientTreatmentRow[]>(
        `${environment.apiUrl}/billing/patients/${patientId}/treatments`,
      ),
    );
  }

  async getTotalBalance(): Promise<{ totalPendingBalance: number }> {
    return await firstValueFrom(
      this.http.get<{ totalPendingBalance: number }>(
        `${environment.apiUrl}/billing/balance/total`,
      ),
    );
  }

  // --- Portal de Pacientes: /billing/me/* ---

  async getMyBalance(): Promise<Balance> {
    return await firstValueFrom(
      this.http.get<Balance>(`${environment.apiUrl}/billing/me/balance`),
    );
  }

  async getMyPayments(
    filter: { startDate?: string; endDate?: string } = {},
  ): Promise<Payment[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    const response = await firstValueFrom(
      this.http.get<{ payments: Payment[] }>(
        `${environment.apiUrl}/billing/me/payments`,
        { params },
      ),
    );
    return response.payments;
  }

  async getMyTreatments(): Promise<PatientTreatmentRow[]> {
    return await firstValueFrom(
      this.http.get<PatientTreatmentRow[]>(
        `${environment.apiUrl}/billing/me/treatments`,
      ),
    );
  }
}
