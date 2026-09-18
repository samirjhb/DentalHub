import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { SelectedPatientService } from '../services/selected-patient.service';
import { PdfService } from '../services/pdf.service';
import {
  PrescriptionService,
  Prescription,
  Medication,
} from '../services/prescription.service';

@Component({
  selector: 'app-prescripciones',
  templateUrl: './prescripciones.component.html',
  styleUrls: ['./prescripciones.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    TablerIconsModule,
  ],
})
export class PrescripcionesComponent implements OnInit {
  pacientes: any[] = [];
  dentistas: StaffMember[] = [];
  selectedPatientId: string | null = null;
  selectedDentistId: string | null = null;
  observations = '';
  medications: Medication[] = [this.emptyMedication()];
  prescriptions: Prescription[] = [];
  isLoading = false;
  isSaving = false;

  // Emitir receta es acto médico — misma matriz que el backend
  // (WRITE_ROLES en prescription.controller.ts). El backend sigue siendo
  // la autoridad real, esto solo evita mostrar un formulario que terminaría
  // en 403 para HYGIENIST/DENTAL_ASSISTANT.
  get canWrite(): boolean {
    const role = this.sessionManager.getRole();
    return role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN' || role === 'DENTIST';
  }

  constructor(
    private pacienteService: PacienteService,
    private staffService: StaffService,
    private sessionManager: SessionManagerService,
    private selectedPatientService: SelectedPatientService,
    private prescriptionService: PrescriptionService,
    private pdfService: PdfService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadPacientes();
    this.loadDentistas();

    // Sincroniza con el paciente elegido desde los otros tabs de Historia Clínica.
    this.selectedPatientService.selectedPatientId.subscribe((patientId) => {
      if (patientId && patientId !== this.selectedPatientId) {
        this.selectedPatientId = patientId;
        this.onPatientChange();
      }
    });
  }

  private emptyMedication(): Medication {
    return { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
  }

  loadPacientes(): void {
    this.pacienteService
      .getPacientes()
      .then((response: any) => {
        this.pacientes = response.patients ?? [];
      })
      .catch((error: any) => {
        console.error('Error al cargar pacientes:', error);
      });
  }

  loadDentistas(): void {
    this.staffService
      .getDentistas()
      .then((dentistas) => {
        this.dentistas = dentistas;
        const role = this.sessionManager.getRole();
        const userId = this.sessionManager.getUserId();
        if (role === 'DENTIST' && userId && dentistas.some((d) => d._id === userId)) {
          this.selectedDentistId = userId;
        }
      })
      .catch((error: any) => {
        console.error('Error al cargar odontólogos:', error);
      });
  }

  onPatientChange(): void {
    this.prescriptions = [];
    if (this.selectedPatientId) {
      this.selectedPatientService.setSelectedPatient(this.selectedPatientId);
      this.loadPrescriptions();
    }
  }

  loadPrescriptions(): void {
    if (!this.selectedPatientId) return;
    this.isLoading = true;
    this.prescriptionService
      .getPrescriptions({ patient: this.selectedPatientId })
      .then((prescriptions) => {
        this.prescriptions = prescriptions;
      })
      .catch(() => {
        this.snackBar.open('Error al cargar las recetas', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  addMedicationRow(): void {
    this.medications.push(this.emptyMedication());
  }

  removeMedicationRow(index: number): void {
    if (this.medications.length > 1) {
      this.medications.splice(index, 1);
    }
  }

  canSubmit(): boolean {
    return (
      !!this.selectedPatientId &&
      !!this.selectedDentistId &&
      this.medications.every((m) => m.name && m.dosage && m.frequency && m.duration)
    );
  }

  emitirReceta(): void {
    if (!this.selectedPatientId || !this.selectedDentistId || !this.canSubmit()) return;
    this.isSaving = true;
    this.prescriptionService
      .createPrescription({
        patient: this.selectedPatientId,
        dentist: this.selectedDentistId,
        medications: this.medications,
        observations: this.observations || undefined,
      })
      .then(() => {
        this.snackBar.open('Receta emitida correctamente', 'Cerrar', { duration: 2000 });
        this.medications = [this.emptyMedication()];
        this.observations = '';
        this.loadPrescriptions();
      })
      .catch((error) => {
        const message = error?.error?.message ?? 'Error al emitir la receta';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  getPatientName(patient: Prescription['patient']): string {
    if (typeof patient === 'object') return patient.name;
    return this.pacientes.find((p) => p._id === patient)?.name ?? patient;
  }

  getDentistName(dentist: Prescription['dentist']): string {
    if (typeof dentist === 'object') return dentist.name;
    return this.dentistas.find((d) => d._id === dentist)?.name ?? dentist;
  }

  generatePdf(prescription: Prescription): void {
    const logoUrl = 'assets/images/logos/logoHadebot.png';
    this.pdfService.generatePrescriptionPdf(
      prescription,
      this.getPatientName(prescription.patient),
      this.getDentistName(prescription.dentist),
      logoUrl,
    );
  }
}
