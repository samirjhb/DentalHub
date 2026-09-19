import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface StaffDialogData {
  name: string;
  email: string;
  password: string;
  role: string;
  // Modo edición: oculta email/contraseña (no se cambian desde acá) y solo
  // valida/envía nombre y rol — ver UpdateStaffDto (backend).
  isEdit?: boolean;
}

export interface StaffDialogResult {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Mismos roles que STAFF_ROLES de CreateStaffDto (backend) — PATIENT no se
// crea desde acá, se registra vía /auth/register.
export const STAFF_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super administrador' },
  { value: 'CLINIC_ADMIN', label: 'Administrador de clínica' },
  { value: 'RECEPTIONIST', label: 'Recepcionista' },
  { value: 'DENTIST', label: 'Dentista' },
  { value: 'HYGIENIST', label: 'Higienista' },
  { value: 'DENTAL_ASSISTANT', label: 'Asistente dental' },
];

@Component({
  selector: 'app-staff-dialog',
  templateUrl: './staff-dialog.component.html',
  styleUrls: ['./staff-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class StaffDialogComponent {
  roleOptions = STAFF_ROLE_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<StaffDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffDialogData,
  ) {}

  get isValid(): boolean {
    const hasNameAndRole = this.data.name.trim().length >= 3 && !!this.data.role;
    if (this.data.isEdit) return hasNameAndRole;
    return (
      hasNameAndRole &&
      /^\S+@\S+\.\S+$/.test(this.data.email) &&
      this.data.password.length >= 6
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (!this.isValid) return;
    const result: StaffDialogResult = {
      name: this.data.name.trim(),
      email: this.data.email.trim(),
      password: this.data.password,
      role: this.data.role,
    };
    this.dialogRef.close(result);
  }
}
