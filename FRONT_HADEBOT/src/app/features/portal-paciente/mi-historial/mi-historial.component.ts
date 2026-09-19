import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  PatientPortalService,
  MyClinicalTreatmentSummary,
} from 'src/app/core/services/patient-portal.service';

@Component({
  selector: 'app-mi-historial',
  standalone: true,
  templateUrl: './mi-historial.component.html',
  styleUrls: ['./mi-historial.component.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
})
export class MiHistorialComponent implements OnInit {
  isLoading = false;
  displayedColumns = ['toothNumber', 'treatment', 'status', 'appointmentDate', 'pendingBalance'];
  dataSource = new MatTableDataSource<MyClinicalTreatmentSummary>([]);

  constructor(
    private patientPortalService: PatientPortalService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.patientPortalService
      .getMyClinicalSummary()
      .then((treatments) => {
        this.dataSource.data = treatments;
      })
      .catch(() => {
        this.snackBar.open('Error al cargar tu historial clínico', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CL');
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }
}
