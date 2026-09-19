import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import {
  AppointmentService,
  Appointment,
} from 'src/app/core/services/appointment.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {
  SolicitarCitaDialogComponent,
  SolicitarCitaDialogResult,
} from './dialogs/solicitar-cita-dialog/solicitar-cita-dialog.component';

// Igual regla que CancelMyAppointmentUseCase (backend): solo se puede cancelar
// una cita Pendiente/Confirmada.
const CANCELABLE_STATUSES = ['Pendiente', 'Confirmada'];

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    TablerIconsModule,
  ],
})
export class MisCitasComponent implements OnInit {
  isLoading = false;
  displayedColumns = ['startAt', 'reason', 'status', 'actions'];
  dataSource = new MatTableDataSource<Appointment>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.appointmentService
      .getMine()
      .then((appointments) => {
        const sorted = [...appointments].sort(
          (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
        );
        this.dataSource.data = sorted;
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
            this.paginator._intl.itemsPerPageLabel = 'Citas por página:';
          }
        });
      })
      .catch(() => {
        this.snackBar.open('Error al cargar tus citas', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  canCancel(appointment: Appointment): boolean {
    return CANCELABLE_STATUSES.includes(appointment.status);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  statusColor(status: string): string {
    if (status === 'Cancelada' || status === 'No asistió') return 'warn';
    if (status === 'Finalizada') return 'primary';
    return 'accent';
  }

  openSolicitarCitaDialog(): void {
    const dialogRef = this.dialog.open(SolicitarCitaDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result: SolicitarCitaDialogResult | undefined) => {
      if (!result) return;
      this.appointmentService
        .requestMine(result)
        .then(() => {
          this.snackBar.open('Cita solicitada correctamente', 'Cerrar', { duration: 2000 });
          this.loadAppointments();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al solicitar la cita';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }

  cancelarCita(appointment: Appointment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Cancelar cita',
        message: `¿Seguro que deseas cancelar tu cita del ${this.formatDate(appointment.startAt)}?`,
        confirmText: 'Cancelar cita',
        cancelText: 'Volver',
        icon: 'calendar-off',
        iconColor: 'text-danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.appointmentService
        .cancelMine(appointment._id)
        .then(() => {
          this.snackBar.open('Cita cancelada', 'Cerrar', { duration: 2000 });
          this.loadAppointments();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al cancelar la cita';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }
}
