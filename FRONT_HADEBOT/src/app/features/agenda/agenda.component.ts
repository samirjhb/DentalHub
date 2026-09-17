import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import {
  AppointmentService,
  Appointment,
  AppointmentStatus,
} from 'src/app/core/services/appointment.service';
import {
  AppointmentDialogComponent,
  AppointmentDialogData,
} from './dialogs/appointment-dialog/appointment-dialog.component';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Pendiente: '#ff9800',
  Confirmada: '#2196f3',
  'En atención': '#9c27b0',
  Finalizada: '#4caf50',
  Cancelada: '#9e9e9e',
  'No asistió': '#f44336',
};

const DEFAULT_DURATION_MINUTES = 60;

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    FullCalendarModule,
  ],
})
export class AgendaComponent implements OnInit {
  private appointmentsById = new Map<string, Appointment>();

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    initialView: 'timeGridWeek',
    events: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    locale: esLocale,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista',
    },
    firstDay: 1,
    nowIndicator: true,
    height: 'auto',
  };

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService
      .getAll()
      .then((appointments) => {
        this.appointmentsById = new Map(appointments.map((a) => [a._id, a]));
        this.calendarOptions = {
          ...this.calendarOptions,
          events: appointments.map((a) => this.toEventInput(a)),
        };
      })
      .catch((error) => {
        console.error('Error al cargar las citas:', error);
        this.snackBar.open('Error al cargar las citas', 'Cerrar', {
          duration: 3000,
        });
      });
  }

  private toEventInput(appointment: Appointment): EventInput {
    return {
      id: appointment._id,
      title: `${appointment.reason}`,
      start: appointment.startAt,
      end: appointment.endAt,
      backgroundColor: STATUS_COLORS[appointment.status],
      borderColor: STATUS_COLORS[appointment.status],
      extendedProps: { appointmentId: appointment._id },
    };
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const data: AppointmentDialogData = {
      mode: 'create',
      startAt: toDatetimeLocalValue(selectInfo.start),
      durationMinutes: DEFAULT_DURATION_MINUTES,
    };

    this.dialog
      .open(AppointmentDialogComponent, { width: '480px', data })
      .afterClosed()
      .subscribe((result: AppointmentDialogData | undefined) => {
        if (!result || !result.patient || !result.dentist) return;
        this.appointmentService
          .create({
            patient: result.patient,
            dentist: result.dentist,
            startAt: new Date(result.startAt).toISOString(),
            durationMinutes: result.durationMinutes,
            reason: result.reason ?? '',
            observations: result.observations,
          })
          .then(() => {
            this.snackBar.open('Cita creada correctamente', 'Cerrar', {
              duration: 2000,
            });
            this.loadAppointments();
          })
          .catch((error) => {
            const message =
              error?.error?.message ?? 'Error al crear la cita';
            this.snackBar.open(message, 'Cerrar', { duration: 3000 });
          });
      });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const appointmentId = clickInfo.event.extendedProps['appointmentId'] as string;
    const appointment = this.appointmentsById.get(appointmentId);
    if (!appointment) return;

    const data: AppointmentDialogData = {
      mode: 'edit',
      patient: appointment.patient,
      dentist: appointment.dentist,
      startAt: toDatetimeLocalValue(new Date(appointment.startAt)),
      durationMinutes: appointment.durationMinutes,
      reason: appointment.reason,
      observations: appointment.observations,
      status: appointment.status,
    };

    this.dialog
      .open(AppointmentDialogComponent, { width: '480px', data })
      .afterClosed()
      .subscribe((result: AppointmentDialogData | undefined) => {
        if (!result) return;
        this.applyEdits(appointment, result);
      });
  }

  private applyEdits(
    original: Appointment,
    result: AppointmentDialogData,
  ): void {
    const updates: Promise<Appointment>[] = [];

    if (result.status && result.status !== original.status) {
      updates.push(
        this.appointmentService.updateStatus(original._id, result.status),
      );
    }

    const newStartAt = new Date(result.startAt).toISOString();
    if (
      newStartAt !== original.startAt ||
      result.durationMinutes !== original.durationMinutes
    ) {
      updates.push(
        this.appointmentService.reschedule(original._id, {
          startAt: newStartAt,
          durationMinutes: result.durationMinutes,
        }),
      );
    }

    if (updates.length === 0) return;

    Promise.all(updates)
      .then(() => {
        this.snackBar.open('Cita actualizada correctamente', 'Cerrar', {
          duration: 2000,
        });
        this.loadAppointments();
      })
      .catch((error) => {
        const message = error?.error?.message ?? 'Error al actualizar la cita';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
      });
  }

  handleEventDrop(dropInfo: EventDropArg): void {
    this.rescheduleFromCalendar(dropInfo.event, () => dropInfo.revert());
  }

  handleEventResize(resizeInfo: EventResizeDoneArg): void {
    this.rescheduleFromCalendar(resizeInfo.event, () => resizeInfo.revert());
  }

  private rescheduleFromCalendar(
    event: { id: string; start: Date | null; end: Date | null },
    revert: () => void,
  ): void {
    if (!event.start || !event.end) return;
    const durationMinutes = Math.round(
      (event.end.getTime() - event.start.getTime()) / 60_000,
    );

    this.appointmentService
      .reschedule(event.id, {
        startAt: event.start.toISOString(),
        durationMinutes,
      })
      .then(() => {
        this.snackBar.open('Cita reprogramada correctamente', 'Cerrar', {
          duration: 2000,
        });
        this.loadAppointments();
      })
      .catch((error) => {
        const message =
          error?.error?.message ?? 'Error al reprogramar la cita';
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        revert();
      });
  }
}
