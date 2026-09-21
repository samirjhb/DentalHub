import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { AvailabilityService } from 'src/app/core/services/availability.service';

// Reemplaza el <input type="datetime-local"> libre de los diálogos de
// agendar cita por una lista real de horarios disponibles del odontólogo —
// evita que el usuario elija una hora que el backend va a rechazar recién al
// guardar (ver VerifyDentistAvailabilityUseCase en el backend).
@Component({
  selector: 'app-available-slots-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './available-slots-picker.component.html',
  styleUrls: ['./available-slots-picker.component.css'],
})
export class AvailableSlotsPickerComponent implements OnChanges {
  @Input() dentistId: string | null | undefined = null;
  @Input() durationMinutes = 60;
  // Fecha inicial a mostrar (yyyy-MM-dd) — por ejemplo, la fecha del slot ya
  // elegido al editar una cita existente.
  @Input() initialDate?: string;
  @Output() slotSelected = new EventEmitter<string>();

  selectedDate: string = this.initialDate || this.today();
  slots: string[] = [];
  selectedSlot: string | null = null;
  loading = false;
  errorMessage: string | null = null;
  private lastRequestId = 0;

  constructor(private availabilityService: AvailabilityService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialDate'] && this.initialDate) {
      this.selectedDate = this.initialDate;
    }
    if (changes['dentistId'] || changes['durationMinutes'] || changes['initialDate']) {
      this.fetchSlots();
    }
  }

  onDateChange(): void {
    this.selectedSlot = null;
    this.fetchSlots();
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
    this.slotSelected.emit(slot);
  }

  // Sin forzar timeZone: el backend ya devuelve el instante UTC real
  // correspondiente a la hora de la clínica (America/Santiago); mostrarlo en
  // la zona local del navegador es lo mismo que después hace el calendario
  // (FullCalendar) al pintar la cita ya creada — mantiene ambas vistas
  // consistentes entre sí.
  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  private async fetchSlots(): Promise<void> {
    if (!this.dentistId || !this.selectedDate) {
      this.slots = [];
      return;
    }

    const requestId = ++this.lastRequestId;
    this.loading = true;
    this.errorMessage = null;

    try {
      const slots = await this.availabilityService.getAvailableSlots(
        this.dentistId,
        this.selectedDate,
        this.durationMinutes,
      );
      // Descarta la respuesta si el usuario ya cambió de fecha/odontólogo
      // mientras la petición estaba en vuelo.
      if (requestId !== this.lastRequestId) return;
      this.slots = slots;
    } catch (error) {
      if (requestId !== this.lastRequestId) return;
      console.error('Error al cargar horarios disponibles:', error);
      this.errorMessage = 'No se pudieron cargar los horarios disponibles';
      this.slots = [];
    } finally {
      if (requestId === this.lastRequestId) this.loading = false;
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
