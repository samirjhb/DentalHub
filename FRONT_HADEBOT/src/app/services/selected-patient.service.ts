import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// Estado compartido mínimo entre las pestañas de Odontograma y Ficha Clínica
// dentro de Historia Clínica — mismo patrón BehaviorSubject que SessionManagerService.
@Injectable({
  providedIn: 'root',
})
export class SelectedPatientService {
  private selectedPatientIdSubject = new BehaviorSubject<string | null>(null);
  // Señal de "el odontograma del paciente actual cambió en otro lado, recargalo" —
  // separada del id seleccionado porque el id puede no cambiar (es el mismo paciente).
  private odontogramUpdatedSubject = new Subject<void>();

  get selectedPatientId(): Observable<string | null> {
    return this.selectedPatientIdSubject.asObservable();
  }

  get odontogramUpdated(): Observable<void> {
    return this.odontogramUpdatedSubject.asObservable();
  }

  setSelectedPatient(patientId: string | null): void {
    this.selectedPatientIdSubject.next(patientId);
  }

  getSelectedPatient(): string | null {
    return this.selectedPatientIdSubject.value;
  }

  notifyOdontogramUpdated(): void {
    this.odontogramUpdatedSubject.next();
  }
}
