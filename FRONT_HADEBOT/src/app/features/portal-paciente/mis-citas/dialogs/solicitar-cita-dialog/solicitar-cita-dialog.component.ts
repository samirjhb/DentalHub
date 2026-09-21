import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import { RequestAppointmentDto } from 'src/app/core/services/appointment.service';
import { AvailableSlotsPickerComponent } from 'src/app/shared/components/available-slots-picker/available-slots-picker.component';

export interface SolicitarCitaDialogResult extends RequestAppointmentDto {}

@Component({
  selector: 'app-solicitar-cita-dialog',
  standalone: true,
  templateUrl: './solicitar-cita-dialog.component.html',
  styleUrls: ['./solicitar-cita-dialog.component.css'],
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
export class SolicitarCitaDialogComponent implements OnInit {
  dentistas: StaffMember[] = [];

  data = {
    dentist: '',
    // ISO completo, seteado por AvailableSlotsPickerComponent al elegir un
    // horario — new Date(...).toISOString() en onConfirm() es idempotente.
    startAt: '',
    durationMinutes: 60,
    reason: '',
  };

  constructor(
    public dialogRef: MatDialogRef<SolicitarCitaDialogComponent>,
    private staffService: StaffService,
  ) {}

  ngOnInit(): void {
    this.staffService
      .getDentistas()
      .then((dentistas) => {
        this.dentistas = dentistas;
      })
      .catch((error) => {
        console.error('Error al cargar odontólogos:', error);
      });
  }

  onSlotSelected(startAt: string): void {
    this.data.startAt = startAt;
  }

  get isValid(): boolean {
    return !!this.data.dentist && !!this.data.startAt && this.data.reason.trim().length > 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (!this.isValid) return;
    const result: SolicitarCitaDialogResult = {
      dentist: this.data.dentist,
      startAt: new Date(this.data.startAt).toISOString(),
      durationMinutes: this.data.durationMinutes,
      reason: this.data.reason.trim(),
    };
    this.dialogRef.close(result);
  }
}
