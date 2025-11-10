import { ChangeDetectorRef, Component, signal, ViewChild, OnInit } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { FichaClinicaService, DentalTreatment } from 'src/app/services/ficha-clinica.service';
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
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { createEventId } from './event-utils';
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

@Component({
  selector: 'app-sales-overview',
  imports: [MaterialModule, TablerIconsModule, NgApexchartsModule, MatButtonModule, FullCalendarModule],
  templateUrl: './sales-overview.component.html',
  styleUrls: ['./sales-overview.component.scss'],
  standalone: true
})
export class AppSalesOverviewComponent implements OnInit {
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    initialEvents: [], // Inicialmente vacío, se cargarán las citas reales
    weekends: true,
    editable: false, // No permitir editar los eventos arrastrándolos
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3, // Limitar a 3 eventos visibles por día
    moreLinkClick: 'popover', // Mostrar popover al hacer clic en "+ más"
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    // Configuración en español
    locale: esLocale,
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    allDayText: 'Todo el día',
    firstDay: 1, // Lunes como primer día de la semana
    eventTimeFormat: { // Formato para mostrar la hora en los eventos
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: false
    },
    eventDisplay: 'block', // Mostrar eventos como bloques
    displayEventTime: true, // Mostrar la hora del evento
    displayEventEnd: false, // No mostrar la hora de fin
    eventInteractive: true, // Hacer los eventos interactivos
    nowIndicator: true, // Mostrar indicador de hora actual
    height: 'auto' // Altura automática
  });
  currentEvents = signal<EventApi[]>([]);

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fichaClinicaService: FichaClinicaService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadAppointments();
  }
  
  // Método para cargar las citas desde las fichas clínicas
  loadAppointments() {
    try {
      // Primero, cargar eventos de prueba para asegurar que el calendario funcione
      this.loadTestEvents();
      
      // Luego intentar cargar las citas reales
      this.fichaClinicaService.getFichasClinicas()
        .then((response: any) => {
          console.log('Cargando citas para el calendario...', response);
          const events: EventInput[] = [];
          
          // Si no hay respuesta o está vacía, mantener los eventos de prueba
          if (!response || response.length === 0) {
            console.warn('No se encontraron fichas clínicas con citas');
            return;
          }
          
          // Procesar cada ficha clínica
          response.forEach((ficha: any) => {
            const pacienteName = ficha.patient?.name || 'Paciente';
            
            // Procesar cada tratamiento con cita programada
            if (ficha.treatments && Array.isArray(ficha.treatments)) {
              ficha.treatments.forEach((treatment: any, index: number) => {
                if (treatment.appointmentDate) {
                  try {
                    const appointmentDate = new Date(treatment.appointmentDate);
                    console.log(`Cita encontrada: ${pacienteName} - ${treatment.treatment}, Fecha: ${appointmentDate.toLocaleString()}`);
                    
                    // Crear evento para el calendario (incluir todas las citas para depuración)
                    events.push({
                      id: `${ficha._id}-${index}`,
                      title: `${pacienteName} - ${treatment.treatment}`,
                      start: appointmentDate,
                      end: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hora después
                      backgroundColor: this.getStatusColor(treatment.status),
                      extendedProps: {
                        fichaId: ficha._id,
                        treatmentIndex: index,
                        diagnosis: treatment.diagnosis,
                        toothNumber: treatment.toothNumber,
                        status: treatment.status
                      }
                    });
                  } catch (dateError) {
                    console.error('Error al procesar fecha de cita:', dateError);
                  }
                }
              });
            }
          });
          
          if (events.length > 0) {
            // Si encontramos eventos reales, reemplazar los de prueba
            this.updateCalendarOptions({ events });
            console.log(`Se cargaron ${events.length} citas en el calendario`);
          }
        })
        .catch((error: any) => {
          console.error('Error al cargar citas para el calendario:', error);
          this.snackBar.open('Error al cargar las citas reales, mostrando citas de prueba', 'Cerrar', {
            duration: 5000,
            panelClass: ['warning-snackbar']
          });
        });
    } catch (error) {
      console.error('Error al intentar cargar citas:', error);
      this.snackBar.open('Error al cargar las citas, mostrando citas de prueba', 'Cerrar', {
        duration: 5000,
        panelClass: ['warning-snackbar']
      });
    }
  }
  
  // Cargar eventos de prueba para asegurar que el calendario funcione
  loadTestEvents() {
    const today = new Date();
    
    // Crear fechas para eventos de prueba
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 30, 0); // 9:30 AM
    
    const tomorrow2 = new Date(today);
    tomorrow2.setDate(tomorrow2.getDate() + 1);
    tomorrow2.setHours(14, 0, 0); // 2:00 PM
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(11, 0, 0); // 11:00 AM
    
    // Crear eventos de prueba que siempre se mostrarán
    const testEvents: EventInput[] = [
      {
        id: 'test-1',
        title: 'Juan Pérez - Limpieza dental',
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hora después
        backgroundColor: '#ff9800',
        borderColor: '#ff9800',
        textColor: '#ffffff',
        classNames: ['custom-event'],
        extendedProps: {
          diagnosis: 'Limpieza preventiva',
          toothNumber: 'Todas',
          status: 'Pendiente'
        }
      },
      {
        id: 'test-2',
        title: 'María Rodríguez - Extracción',
        start: tomorrow2,
        end: new Date(tomorrow2.getTime() + 60 * 60 * 1000), // 1 hora después
        backgroundColor: '#2196f3',
        borderColor: '#2196f3',
        textColor: '#ffffff',
        classNames: ['custom-event'],
        extendedProps: {
          diagnosis: 'Muela del juicio',
          toothNumber: '38',
          status: 'En proceso'
        }
      },
      {
        id: 'test-3',
        title: 'Pedro Sánchez - Endodoncia',
        start: nextWeek,
        end: new Date(nextWeek.getTime() + 90 * 60 * 1000), // 1.5 horas después
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
        textColor: '#ffffff',
        classNames: ['custom-event'],
        extendedProps: {
          diagnosis: 'Pulpitis irreversible',
          toothNumber: '26',
          status: 'Pendiente'
        }
      }
    ];
    
    // Actualizar el calendario con los eventos de prueba
    this.updateCalendarOptions({ events: testEvents });
    console.log('Se cargaron eventos de prueba en el calendario');
  }
  
  // Método para obtener el color según el estado del tratamiento
  getStatusColor(status: string): string {
    switch (status) {
      case 'Pendiente': return '#ff9800'; // Naranja
      case 'En proceso': return '#2196f3'; // Azul
      case 'Completado': return '#4caf50'; // Verde
      case 'Cancelado': return '#f44336'; // Rojo
      default: return '#9e9e9e'; // Gris
    }
  }

  // Método para actualizar opciones del calendario si es necesario
  updateCalendarOptions(newOptions: Partial<CalendarOptions>) {
    this.calendarOptions.update((options) => ({
      ...options,
      ...newOptions
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Ingrese un título para la nueva cita');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); 

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    // Mostrar información detallada del evento en lugar de eliminarlo
    const event = clickInfo.event;
    const props = event.extendedProps as any;
    
    // Crear mensaje con detalles de la cita
    const message = `
      Paciente: ${event.title.split(' - ')[0]}
      Tratamiento: ${event.title.split(' - ')[1]}
      Diagnóstico: ${props.diagnosis}
      Pieza dental: ${props.toothNumber}
      Estado: ${props.status}
      Fecha y hora: ${event.start?.toLocaleString('es-CL')}
    `;
    
    // Mostrar detalles en un snackbar
    this.snackBar.open(message, 'Cerrar', {
      duration: 10000,
      panelClass: ['info-snackbar']
    });
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
  
}
