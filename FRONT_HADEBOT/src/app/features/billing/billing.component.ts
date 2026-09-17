import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import {
  BillingService,
  Balance,
  Payment,
  PatientTreatmentRow,
} from 'src/app/core/services/billing.service';
import {
  PaymentDialogComponent,
  PaymentDialogResult,
} from 'src/app/shared/components/dialogs/payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    TablerIconsModule,
  ],
})
export class BillingComponent implements OnInit {
  pacientes: any[] = [];
  selectedPatientId: string | null = null;
  isLoading = false;

  balance: Balance | null = null;
  pendingTreatments: PatientTreatmentRow[] = [];
  payments: Payment[] = [];

  pendingColumns = ['treatment', 'toothNumber', 'price', 'deposit', 'pendingBalance', 'actions'];
  paymentColumns = ['paidAt', 'amount', 'method', 'observations'];

  constructor(
    private pacienteService: PacienteService,
    private billingService: BillingService,
    private sessionManager: SessionManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.pacienteService
      .getPacientes()
      .then((response: any) => {
        this.pacientes = response.patients ?? [];
      })
      .catch((error: any) => {
        console.error('Error al cargar pacientes:', error);
      });
  }

  onPatientChange(): void {
    this.balance = null;
    this.pendingTreatments = [];
    this.payments = [];
    if (this.selectedPatientId) {
      this.loadPatientData();
    }
  }

  private loadPatientData(): void {
    if (!this.selectedPatientId) return;
    this.isLoading = true;

    Promise.all([
      this.billingService.getPatientBalance(this.selectedPatientId),
      // Endpoint propio de Billing (no clinical-record) — RECEPTIONIST no
      // tiene acceso a clinical-record, solo a la vista de dinero.
      this.billingService.getPatientTreatments(this.selectedPatientId),
      this.billingService.getPayments({ patient: this.selectedPatientId }),
    ])
      .then(([balance, treatments, payments]) => {
        this.balance = balance;
        this.pendingTreatments = treatments;
        this.payments = payments;
      })
      .catch((error) => {
        console.error('Error al cargar datos de cobranza:', error);
        this.snackBar.open('Error al cargar los datos del paciente', 'Cerrar', {
          duration: 3000,
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  openPaymentDialog(row: PatientTreatmentRow): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '400px',
      data: {
        title: 'Registrar Pago',
        message: `${row.treatment} (pieza ${row.toothNumber}) — saldo pendiente $${row.pendingBalance}`,
        confirmText: 'Registrar',
        cancelText: 'Cancelar',
        icon: 'cash',
        iconColor: 'text-success',
        amount: 0,
        method: 'EFECTIVO',
      },
    });

    dialogRef.afterClosed().subscribe((result: PaymentDialogResult | undefined) => {
      if (!result) return;
      const registeredBy = this.sessionManager.getUserId();
      if (!registeredBy) {
        this.snackBar.open('No se pudo identificar al usuario logueado', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      this.billingService
        .registerPayment({
          clinicalRecord: row.clinicalRecordId,
          treatmentIndex: row.treatmentIndex,
          amount: result.amount,
          method: result.method,
          registeredBy,
        })
        .then(() => {
          this.snackBar.open('Pago registrado correctamente', 'Cerrar', {
            duration: 2000,
          });
          this.loadPatientData();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al registrar el pago';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }
}
