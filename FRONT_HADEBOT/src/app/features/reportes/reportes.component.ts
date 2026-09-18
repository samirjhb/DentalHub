import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { StaffService, StaffMember } from 'src/app/core/services/staff.service';
import { StatCardComponent } from 'src/app/shared/components/stat-card/stat-card.component';
import {
  ReportsService,
  RevenueSummary,
  TreatmentsSummary,
  AppointmentsSummary,
} from './services/reports.service';

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

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgApexchartsModule,
    StatCardComponent,
  ],
})
export class ReportesComponent implements OnInit {
  startDate: Date | null = null;
  endDate: Date | null = null;
  isLoading = false;

  revenue: RevenueSummary | null = null;
  treatments: TreatmentsSummary | null = null;
  appointments: AppointmentsSummary | null = null;
  newPatientsCount = 0;

  dentistas: StaffMember[] = [];

  revenueChart: BarChartOptions = this.emptyBarChart();
  treatmentsChart: DonutChartOptions = this.emptyDonutChart();
  appointmentsStatusChart: DonutChartOptions = this.emptyDonutChart();
  appointmentsByDentistChart: BarChartOptions = this.emptyBarChart();

  constructor(
    private reportsService: ReportsService,
    private staffService: StaffService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.staffService
      .getDentistas()
      .then((dentistas) => {
        this.dentistas = dentistas;
      })
      .catch((error) => {
        console.error('Error al cargar odontólogos:', error);
      });
    this.loadReports();
  }

  private emptyBarChart(): BarChartOptions {
    return {
      series: [{ name: 'Total', data: [] }],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      xaxis: { categories: [] },
      dataLabels: { enabled: true },
      plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    };
  }

  private emptyDonutChart(): DonutChartOptions {
    return {
      series: [],
      chart: { type: 'donut', height: 280 },
      labels: [],
      responsive: [],
      legend: { position: 'bottom' },
    };
  }

  getDentistName(id: string): string {
    return this.dentistas.find((d) => d._id === id)?.name ?? id;
  }

  loadReports(): void {
    this.isLoading = true;
    const filter = {
      startDate: this.startDate ? this.startDate.toISOString() : undefined,
      endDate: this.endDate ? this.endDate.toISOString() : undefined,
    };

    Promise.all([
      this.reportsService.getRevenue(filter),
      this.reportsService.getTreatments(filter),
      this.reportsService.getAppointments(filter),
      this.reportsService.getNewPatients(filter),
    ])
      .then(([revenue, treatments, appointments, newPatients]) => {
        this.revenue = revenue;
        this.treatments = treatments;
        this.appointments = appointments;
        this.newPatientsCount = newPatients.count;
        this.buildCharts();
      })
      .catch(() => {
        this.snackBar.open('Error al cargar los reportes', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private buildCharts(): void {
    if (this.revenue) {
      const methods = Object.keys(this.revenue.byMethod);
      this.revenueChart = {
        ...this.emptyBarChart(),
        series: [
          {
            name: 'Ingresos',
            data: methods.map((m) => this.revenue!.byMethod[m as keyof typeof this.revenue.byMethod]),
          },
        ],
        xaxis: { categories: methods },
      };
    }

    if (this.treatments) {
      const statuses = Object.keys(this.treatments.byStatus);
      this.treatmentsChart = {
        ...this.emptyDonutChart(),
        series: statuses.map((s) => this.treatments!.byStatus[s]),
        labels: statuses,
      };
    }

    if (this.appointments) {
      const statuses = Object.keys(this.appointments.byStatus);
      this.appointmentsStatusChart = {
        ...this.emptyDonutChart(),
        series: statuses.map((s) => this.appointments!.byStatus[s]),
        labels: statuses,
      };

      this.appointmentsByDentistChart = {
        ...this.emptyBarChart(),
        series: [
          {
            name: 'Citas',
            data: this.appointments.byDentist.map((d) => d.count),
          },
        ],
        xaxis: {
          categories: this.appointments.byDentist.map((d) => this.getDentistName(d.dentist)),
        },
      };
    }
  }

  applyFilter(): void {
    this.loadReports();
  }

  clearFilter(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadReports();
  }
}
