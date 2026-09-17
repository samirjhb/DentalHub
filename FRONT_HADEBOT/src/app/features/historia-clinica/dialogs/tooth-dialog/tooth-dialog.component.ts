import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToothStatus } from 'src/app/features/historia-clinica/services/odontograma.service';

export interface ToothDialogData {
  toothNumber: string;
  toothLabel: string;
  status: ToothStatus;
  observations?: string;
}

export const TOOTH_STATUS_OPTIONS: { value: ToothStatus; label: string }[] = [
  { value: 'Sano', label: 'Sano' },
  { value: 'Cariado', label: 'Cariado' },
  { value: 'Obturado', label: 'Obturado' },
  { value: 'Ausente', label: 'Ausente' },
  { value: 'Corona', label: 'Corona' },
  { value: 'Endodoncia', label: 'Endodoncia' },
  { value: 'Implante', label: 'Implante' },
  { value: 'Fracturado', label: 'Fracturado' },
  { value: 'Sellante', label: 'Sellante' },
  { value: 'ExtraccionIndicada', label: 'Extracción indicada' },
];

@Component({
  selector: 'app-tooth-dialog',
  templateUrl: './tooth-dialog.component.html',
  styleUrls: ['./tooth-dialog.component.css'],
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
  ],
})
export class ToothDialogComponent {
  statusOptions = TOOTH_STATUS_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<ToothDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ToothDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close({
      status: this.data.status,
      observations: this.data.observations,
    });
  }
}
