import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import {
  StaffDialogComponent,
  StaffDialogResult,
  STAFF_ROLE_OPTIONS,
} from './dialogs/staff-dialog/staff-dialog.component';

@Component({
  selector: 'app-administracion',
  standalone: true,
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    TablerIconsModule,
  ],
})
export class AdministracionComponent implements OnInit {
  isLoading = false;
  displayedColumns = ['name', 'email', 'role', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<StaffMember>([]);

  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private staffService: StaffService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading = true;
    this.staffService
      .getAllStaff(this.pageIndex + 1, this.pageSize)
      .then((response) => {
        // La exclusión de PATIENT ya la hace el servidor (excludeRole),
        // así la paginación no queda con páginas incompletas.
        this.dataSource.data = response.data;
        this.totalItems = response.total;
        setTimeout(() => {
          if (this.paginator) {
            this.paginator._intl.itemsPerPageLabel = 'Personal por página:';
          }
        });
      })
      .catch(() => {
        this.snackBar.open('Error al cargar el personal', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadStaff();
  }

  roleLabel(role: string): string {
    return STAFF_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL');
  }

  openStaffDialog(): void {
    const dialogRef = this.dialog.open(StaffDialogComponent, {
      width: '420px',
      data: { name: '', email: '', password: '', role: '' },
    });

    dialogRef.afterClosed().subscribe((result: StaffDialogResult | undefined) => {
      if (!result) return;
      this.staffService
        .createStaff(result)
        .then(() => {
          this.snackBar.open('Personal creado correctamente', 'Cerrar', { duration: 2000 });
          this.loadStaff();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al crear el personal';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }

  openEditDialog(member: StaffMember): void {
    const dialogRef = this.dialog.open(StaffDialogComponent, {
      width: '420px',
      data: {
        name: member.name,
        email: member.email,
        password: '',
        role: member.role,
        isEdit: true,
      },
    });

    dialogRef.afterClosed().subscribe((result: StaffDialogResult | undefined) => {
      if (!result) return;
      this.staffService
        .updateStaff(member._id, { name: result.name, role: result.role })
        .then(() => {
          this.snackBar.open('Personal actualizado correctamente', 'Cerrar', { duration: 2000 });
          this.loadStaff();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al actualizar el personal';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }
}
