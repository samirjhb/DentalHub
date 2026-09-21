import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/shared/material.module';
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { Role } from 'src/app/core/auth/enums/role.enum';
import {
  AvailabilityService,
  ScheduleBlock,
  DateException,
} from 'src/app/core/services/availability.service';
import {
  DateExceptionDialogComponent,
  DateExceptionDialogResult,
} from './dialogs/date-exception-dialog/date-exception-dialog.component';

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const ADMIN_ROLES: (Role | string)[] = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

@Component({
  selector: 'app-mi-horario',
  standalone: true,
  templateUrl: './mi-horario.component.html',
  styleUrls: ['./mi-horario.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatDialogModule,
    MatSnackBarModule,
    TablerIconsModule,
  ],
})
export class MiHorarioComponent implements OnInit {
  days = DAYS;
  isAdmin = false;
  dentistas: StaffMember[] = [];
  selectedDentistId: string | null = null;

  blocks: ScheduleBlock[] = [];
  exceptions: DateException[] = [];
  loading = false;
  saving = false;

  constructor(
    private staffService: StaffService,
    private availabilityService: AvailabilityService,
    private sessionManager: SessionManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const role = this.sessionManager.getRole();
    this.isAdmin = ADMIN_ROLES.includes(role ?? '');

    if (this.isAdmin) {
      this.staffService
        .getDentistas()
        .then((dentistas) => (this.dentistas = dentistas))
        .catch((error) => console.error('Error al cargar odontólogos:', error));
    } else {
      this.selectedDentistId = this.sessionManager.getUserId();
      this.loadSchedule();
    }
  }

  onDentistChange(): void {
    this.loadSchedule();
  }

  blocksForDay(day: number): ScheduleBlock[] {
    return this.blocks.filter((b) => b.dayOfWeek === day);
  }

  addBlock(day: number): void {
    this.blocks.push({ dayOfWeek: day, startTime: '09:00', endTime: '13:00' });
  }

  removeBlock(block: ScheduleBlock): void {
    this.blocks = this.blocks.filter((b) => b !== block);
  }

  async saveSchedule(): Promise<void> {
    if (!this.selectedDentistId) return;
    this.saving = true;
    try {
      await this.availabilityService.updateSchedule(this.selectedDentistId, this.blocks);
      this.snackBar.open('Horario guardado', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al guardar el horario:', error);
      this.snackBar.open('No se pudo guardar el horario', 'Cerrar', { duration: 5000 });
    } finally {
      this.saving = false;
    }
  }

  openExceptionDialog(): void {
    if (!this.selectedDentistId) return;
    const dentistId = this.selectedDentistId;
    this.dialog
      .open(DateExceptionDialogComponent, { width: '420px' })
      .afterClosed()
      .subscribe(async (result: DateExceptionDialogResult | undefined) => {
        if (!result) return;
        try {
          const exception = await this.availabilityService.addException(dentistId, result);
          this.exceptions = [...this.exceptions, exception];
        } catch (error) {
          console.error('Error al bloquear la fecha:', error);
          this.snackBar.open('No se pudo bloquear la fecha', 'Cerrar', { duration: 5000 });
        }
      });
  }

  async deleteException(exception: DateException): Promise<void> {
    if (!this.selectedDentistId) return;
    try {
      await this.availabilityService.deleteException(this.selectedDentistId, exception._id);
      this.exceptions = this.exceptions.filter((e) => e._id !== exception._id);
    } catch (error) {
      console.error('Error al eliminar el bloqueo:', error);
      this.snackBar.open('No se pudo eliminar el bloqueo', 'Cerrar', { duration: 5000 });
    }
  }

  private async loadSchedule(): Promise<void> {
    if (!this.selectedDentistId) return;
    this.loading = true;
    try {
      const [schedule, exceptions] = await Promise.all([
        this.availabilityService.getSchedule(this.selectedDentistId),
        this.availabilityService.listExceptions(this.selectedDentistId),
      ]);
      this.blocks = schedule.blocks;
      this.exceptions = exceptions;
    } catch (error) {
      console.error('Error al cargar el horario:', error);
      this.snackBar.open('No se pudo cargar el horario', 'Cerrar', { duration: 5000 });
    } finally {
      this.loading = false;
    }
  }
}
