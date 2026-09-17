import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export type PaymentMethod = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

// Renombrado desde DepositDialogComponent (vivía en
// features/historia-clinica/dialogs/) al volverse genuinamente cross-feature:
// lo usan Historia Clínica y Cobranza (Billing).
export interface PaymentDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon?: string;
  iconColor?: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentDialogResult {
  amount: number;
  method: PaymentMethod;
}

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TablerIconsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class PaymentDialogComponent {
  methodOptions = PAYMENT_METHOD_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.amount > 0 && this.data.method) {
      const result: PaymentDialogResult = {
        amount: this.data.amount,
        method: this.data.method,
      };
      this.dialogRef.close(result);
    }
  }
}
