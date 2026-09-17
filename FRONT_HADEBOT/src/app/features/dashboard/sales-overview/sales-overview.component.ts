import { ChangeDetectorRef, Component, signal, OnInit } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/shared/material.module';
import { AppointmentService, AppointmentStatus } from 'src/app/core/services/appointment.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
  ApexPlotOptions,
  ApexFill,
  ApexMarkers,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { CalendarOptions, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { NgFor, NgIf } from '@angular/common';
import esLocale from '@fullcalendar/core/locales/es';

interface month {
  value: string;
  viewValue: string;
}

export interface salesOverviewChart {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
  grid: ApexGrid;
  marker: ApexMarkers;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pendiente: '#ff9800',
  Confirmada: '#2196f3',
  'En atención': '#9c27b0',
  Finalizada: '#4caf50',
  Cancelada: '#9e9e9e',
  'No asistió': '#f44336',
};

@Component({
  selector: 'app-sales-overview',
  imports: [MaterialModule, TablerIconsModule, NgApexchartsModule, MatButtonModule, FullCalendarModule],
  templateUrl: './sales-overview.component.html',
  styleUrls: ['./sales-overview.component.scss'],
  standalone: true
})
export class AppSalesOverviewComponent implements OnInit {
  // Widget de solo vista previa — la gestión completa (crear/reprogramar/cambiar
  // estado) vive en la página "Agenda" real (components/agenda).
  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    initialView: 'dayGridMonth',
    events: [],
    weekends: true,
    editable: false,
    selectable: false,
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    locale: esLocale,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    allDayText: 'Todo el día',
    firstDay: 1,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: false
    },
    eventDisplay: 'block',
    displayEventTime: true,
    displayEventEnd: false,
    nowIndicator: true,
    height: 'auto'
  });
  currentEvents = signal<EventApi[]>([]);

  constructor(
    private changeDetector: ChangeDetectorRef,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService
      .getAll()
      .then((appointments) => {
        const events: EventInput[] = appointments
          .filter((a) => a.status !== 'Cancelada')
          .map((a) => ({
            id: a._id,
            title: a.reason,
            start: a.startAt,
            end: a.endAt,
            backgroundColor: STATUS_COLORS[a.status],
            borderColor: STATUS_COLORS[a.status],
            extendedProps: { status: a.status },
          }));
        this.updateCalendarOptions({ events });
      })
      .catch((error: any) => {
        console.error('Error al cargar las citas para el calendario:', error);
        this.snackBar.open('Error al cargar las citas', 'Cerrar', {
          duration: 3000,
        });
      });
  }

  updateCalendarOptions(newOptions: Partial<CalendarOptions>) {
    this.calendarOptions.update((options) => ({
      ...options,
      ...newOptions
    }));
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;
    const status = (event.extendedProps as any).status;
    const message = `${event.title} — ${status} — ${event.start?.toLocaleString('es-CL')}`;
    this.snackBar.open(message, 'Cerrar', {
      duration: 6000,
    });
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges();
  }
}
