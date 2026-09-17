import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { AppSalesOverviewComponent } from 'src/app/features/dashboard/sales-overview/sales-overview.component';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card.component';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';

@Component({
  selector: 'app-starter',
  imports: [
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

  constructor(
    private pacienteService: PacienteService,
    private appointmentService: AppointmentService,
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
  }
}
