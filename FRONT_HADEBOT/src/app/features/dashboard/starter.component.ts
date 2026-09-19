import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { AppSalesOverviewComponent } from 'src/app/features/dashboard/sales-overview/sales-overview.component';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card.component';
import { PacienteService } from 'src/app/core/services/paciente.service';
import {
  AppointmentService,
  Appointment,
  AppointmentStatus,
} from 'src/app/core/services/appointment.service';
import { BillingService } from 'src/app/core/services/billing.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import {
  ReportsService,
  RevenueSummary,
  TreatmentsSummary,
} from 'src/app/features/reportes/services/reports.service';
import { InventoryService, InventoryItem } from 'src/app/features/inventario/services/inventory.service';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
} from 'ng-apexcharts';

export interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
}

export interface DonutChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
}

const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pendiente: '#ff9800',
  Confirmada: '#2196f3',
  'En atención': '#9c27b0',
  Finalizada: '#4caf50',
  Cancelada: '#9e9e9e',
  'No asistió': '#f44336',
};

@Component({
  selector: 'app-starter',
  imports: [
    CommonModule,
    MaterialModule,
    AppSalesOverviewComponent,
    StatCardComponent,
    NgApexchartsModule,
  ],
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  patientsCount = 0;
  todaysAppointments: Appointment[] = [];
  totalPendingBalance: number | null = null;
  lowStockItems: InventoryItem[] = [];
  totalRevenue: number | null = null;

  revenueChart: BarChartOptions = this.emptyBarChart();
  treatmentsChart: DonutChartOptions = this.emptyDonutChart();
  // ng-apexcharts no re-renderiza bien si se le reemplaza el objeto de
  // opciones completo DESPUÉS de haber creado el <apx-chart> ya una vez
  // vacío — el gráfico queda con ejes por defecto y sin barras/porciones,
  // aunque los datos lleguen bien. Se evita creándolo recién cuando ya hay
  // datos reales (*ngIf="reportsLoaded" en el template), en vez de crearlo
  // vacío y actualizarlo después.
  reportsLoaded = false;

  // GET /billing/balance/total y GET /reports/* están restringidos a
  // SUPER_ADMIN/CLINIC_ADMIN en el backend (métricas de gestión, no
  // operativas) — se piden solo para esos roles para no disparar un 403
  // silencioso a otros roles que sí ven el dashboard.
  get canSeeTotalBalance(): boolean {
    const role = this.sessionManager.getRole();
    return role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN';
  }

  get canSeeReports(): boolean {
    return this.canSeeTotalBalance;
  }

  constructor(
    private pacienteService: PacienteService,
    private appointmentService: AppointmentService,
    private billingService: BillingService,
    private sessionManager: SessionManagerService,
    private reportsService: ReportsService,
    private inventoryService: InventoryService,
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
        this.todaysAppointments = appointments
          .filter((a) => a.status !== 'Cancelada')
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
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

    // Disponible para todo el staff (mismos roles que pueden ver Inventario),
    // sin gate adicional acá.
    this.inventoryService
      .getLowStockItems()
      .then((items) => {
        this.lowStockItems = items;
      })
      .catch((error: any) => {
        console.error('Error al cargar el inventario con stock bajo:', error);
      });

    if (this.canSeeReports) {
      this.loadReports();
    }
  }

  get lowStockCount(): number {
    return this.lowStockItems.length;
  }

  statusColor(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_COLORS[status] ?? '#5d87ff';
  }

  private loadReports(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const filter = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    Promise.all([
      this.reportsService.getRevenue(filter),
      this.reportsService.getTreatments(filter),
    ])
      .then(([revenue, treatments]) => {
        this.buildRevenueChart(revenue);
        this.buildTreatmentsChart(treatments);
        this.reportsLoaded = true;
      })
      .catch((error: any) => {
        console.error('Error al cargar los reportes del dashboard:', error);
      });
  }

  private buildRevenueChart(revenue: RevenueSummary): void {
    this.totalRevenue = revenue.totalRevenue;
    const methods = Object.keys(revenue.byMethod);
    this.revenueChart = {
      ...this.emptyBarChart(),
      series: [
        {
          name: 'Ingresos',
          data: methods.map(
            (m) => revenue.byMethod[m as keyof typeof revenue.byMethod],
          ),
        },
      ],
      xaxis: { categories: methods },
    };
  }

  private buildTreatmentsChart(treatments: TreatmentsSummary): void {
    const statuses = Object.keys(treatments.byStatus);
    this.treatmentsChart = {
      ...this.emptyDonutChart(),
      series: statuses.map((s) => treatments.byStatus[s]),
      labels: statuses,
    };
  }

  private emptyBarChart(): BarChartOptions {
    return {
      series: [{ name: 'Ingresos', data: [] }],
      chart: { type: 'bar', height: 260, toolbar: { show: false } },
      xaxis: { categories: [] },
      dataLabels: { enabled: true },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    };
  }

  private emptyDonutChart(): DonutChartOptions {
    return {
      series: [],
      chart: { type: 'donut', height: 260 },
      labels: [],
      responsive: [],
      legend: { position: 'bottom' },
    };
  }
}
