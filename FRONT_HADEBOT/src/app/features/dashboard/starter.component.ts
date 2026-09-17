import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { AppSalesOverviewComponent } from 'src/app/features/dashboard/sales-overview/sales-overview.component';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card.component';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { BillingService } from 'src/app/core/services/billing.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';

@Component({
  selector: 'app-starter',
  imports: [
    CommonModule,
    MaterialModule,
    AppSalesOverviewComponent,
    StatCardComponent,
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  patientsCount = 0;
  todaysAppointmentsCount = 0;
  totalPendingBalance: number | null = null;

  // GET /billing/balance/total está restringido a SUPER_ADMIN/CLINIC_ADMIN en
  // el backend (métrica de gestión, no operativa) — se pide solo para esos
  // roles para no disparar un 403 silencioso a otros roles que sí ven el
  // dashboard (mismo criterio ya usado para filtrar el sidebar por rol).
  get canSeeTotalBalance(): boolean {
    const role = this.sessionManager.getRole();
    return role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN';
  }

  constructor(
    private pacienteService: PacienteService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private sessionManager: SessionManagerService,
  ) {}

  ngOnInit(): void {
    this.pacienteService
      .getPacientes()
      .then((response: any) => {
        this.patientsCount = (response.patients ?? []).length;
      })
      .catch((error: any) => {
        console.error('Error al cargar el total de pacientes:', error);
      });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    this.appointmentService
      .getAll({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      })
      .then((appointments) => {
        this.todaysAppointmentsCount = appointments.filter(
          (a) => a.status !== 'Cancelada',
        ).length;
      })
      .catch((error: any) => {
        console.error('Error al cargar las citas de hoy:', error);
      });

    if (this.canSeeTotalBalance) {
      this.billingService
        .getTotalBalance()
        .then((response) => {
          this.totalPendingBalance = response.totalPendingBalance;
        })
        .catch((error: any) => {
          console.error('Error al cargar el saldo pendiente total:', error);
        });
    }
  }
}
