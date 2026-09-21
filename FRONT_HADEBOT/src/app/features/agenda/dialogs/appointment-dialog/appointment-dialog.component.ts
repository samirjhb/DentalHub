import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import { AppointmentStatus } from 'src/app/core/services/appointment.service';
import { AvailableSlotsPickerComponent } from 'src/app/shared/components/available-slots-picker/available-slots-picker.component';

export interface AppointmentDialogData {
  mode: 'create' | 'edit';
  patient?: string;
  dentist?: string;
  startAt: string; // formato compatible con <input type="datetime-local">
  durationMinutes: number;
  reason?: string;
  observations?: string;
  status?: AppointmentStatus;
}

export const APPOINTMENT_STATUS_OPTIONS: AppointmentStatus[] = [
  'Pendiente',
  'Confirmada',
  'En atención',
  'Finalizada',
  'Cancelada',
  'No asistió',
];

@Component({
  selector: 'app-appointment-dialog',
  templateUrl: './appointment-dialog.component.html',
  styleUrls: ['./appointment-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TablerIconsModule,
    AvailableSlotsPickerComponent,
  ],
})
export class AppointmentDialogComponent implements OnInit {
  statusOptions = APPOINTMENT_STATUS_OPTIONS;
  pacientes: any[] = [];
  dentistas: StaffMember[] = [];
  initialDate?: string;

  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentDialogData,
    private pacienteService: PacienteService,
    private staffService: StaffService,
  ) {
    // Precarga la fecha del picker con la que ya trae `data` (elegida al
    // editar, o adivinada por el drag-select del calendario al crear).
    this.initialDate = data.startAt ? data.startAt.slice(0, 10) : undefined;
    // En modo creación, ese horario es solo un punto de partida para la
    // fecha — se exige elegir un slot real de la lista antes de guardar en
    // vez de confiar en la hora "adivinada" por el drag-select del calendario.
    if (data.mode === 'create') {
      this.data.startAt = '';
    }
  }

  ngOnInit(): void {
    this.pacienteService
      .getPacientes()
      .then((response: any) => {
        this.pacientes = response.patients ?? [];
      })
      .catch((error: any) => {
        console.error('Error al cargar pacientes:', error);
      });

    this.staffService
      .getDentistas()
      .then((dentistas) => {
        this.dentistas = dentistas;
      })
      .catch((error: any) => {
        console.error('Error al cargar odontólogos:', error);
      });
  }

  onSlotSelected(startAt: string): void {
    this.data.startAt = startAt;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }
}
