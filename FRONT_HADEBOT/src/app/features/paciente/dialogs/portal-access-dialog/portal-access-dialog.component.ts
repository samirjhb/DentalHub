import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TablerIconsModule } from 'angular-tabler-icons';

// El estado "linked"/"linkedEmail" se resuelve ANTES de abrir el diálogo
// (paciente.component.ts hace el GET /auth/patient-access/:id) — el diálogo
// es puramente presentacional, mismo patrón que StaffDialogComponent.
export interface PortalAccessDialogData {
  patientId: string;
  patientName: string;
  patientEmail: string;
  linked: boolean;
  linkedEmail: string | null;
}

export interface PortalAccessDialogResult {
  patientId: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-portal-access-dialog',
  templateUrl: './portal-access-dialog.component.html',
  styleUrls: ['./portal-access-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TablerIconsModule,
  ],
})
export class PortalAccessDialogComponent {
  form = {
    email: this.data.patientEmail ?? '',
    password: '',
  };

  constructor(
    public dialogRef: MatDialogRef<PortalAccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PortalAccessDialogData,
  ) {}

  get isValid(): boolean {
    return /^\S+@\S+\.\S+$/.test(this.form.email) && this.form.password.length >= 6;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (!this.isValid) return;
    const result: PortalAccessDialogResult = {
      patientId: this.data.patientId,
      email: this.form.email.trim(),
      password: this.form.password,
    };
    this.dialogRef.close(result);
  }
}
