import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card.component';
import {
  BillingService,
  Balance,
  Payment,
  PatientTreatmentRow,
} from 'src/app/core/services/billing.service';

@Component({
  selector: 'app-mi-facturacion',
  standalone: true,
  templateUrl: './mi-facturacion.component.html',
  styleUrls: ['./mi-facturacion.component.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatGridListModule,
    StatCardComponent,
  ],
})
export class MiFacturacionComponent implements OnInit {
  isLoading = false;
  balance: Balance | null = null;

  paymentsColumns = ['paidAt', 'amount', 'method'];
  paymentsDataSource = new MatTableDataSource<Payment>([]);

  treatmentsColumns = ['treatment', 'toothNumber', 'price', 'deposit', 'pendingBalance'];
  treatmentsDataSource = new MatTableDataSource<PatientTreatmentRow>([]);

  constructor(
    private billingService: BillingService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    Promise.all([
      this.billingService.getMyBalance(),
      this.billingService.getMyPayments(),
      this.billingService.getMyTreatments(),
    ])
      .then(([balance, payments, treatments]) => {
        this.balance = balance;
        this.paymentsDataSource.data = [...payments].sort(
          (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
        );
        this.treatmentsDataSource.data = treatments;
      })
      .catch(() => {
        this.snackBar.open('Error al cargar tu facturación', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL');
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }
}
