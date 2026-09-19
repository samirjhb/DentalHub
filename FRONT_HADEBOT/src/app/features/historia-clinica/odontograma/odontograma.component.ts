import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import dentalPieces from 'src/assets/i18n/dental-pieces.json';
import { PacienteService } from 'src/app/core/services/paciente.service';
import { SelectedPatientService } from 'src/app/features/historia-clinica/services/selected-patient.service';
import {
  OdontogramaService,
  Odontogram,
  ToothState,
  ToothStatus,
} from 'src/app/features/historia-clinica/services/odontograma.service';
import {
  ToothDialogComponent,
  ToothDialogData,
} from '../dialogs/tooth-dialog/tooth-dialog.component';

interface DentalPieceOption {
  value: string;
  label: string;
}

// Cuadrantes en orden clínico estándar (arcada superior y luego inferior,
// cada una separada por la línea media).
const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];

const STATUS_COLORS: Record<ToothStatus, string> = {
  Sano: '#4CAF50',
  Cariado: '#F44336',
  Obturado: '#2196F3',
  Ausente: '#9E9E9E',
  Corona: '#FFC107',
  Endodoncia: '#9C27B0',
  Implante: '#009688',
  Fracturado: '#FF5722',
  Sellante: '#03A9F4',
  ExtraccionIndicada: '#795548',
};

@Component({
  selector: 'app-odontograma',
  templateUrl: './odontograma.component.html',
  styleUrls: ['./odontograma.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TablerIconsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
})
export class OdontogramaComponent implements OnInit {
  // false cuando se embebe dentro de otra pantalla (ej. Ficha Clínica) que ya
  // tiene su propio selector de paciente y sincroniza vía SelectedPatientService.
  @Input() showPatientSelector = true;

  // true cuando se embebe dentro de Ficha Clínica: clic en una pieza deja de
  // abrir el diálogo de solo-estado y en su lugar emite addTreatmentForTooth,
  // para que el padre abra el alta de tratamiento con esa pieza precargada.
  @Input() treatmentMode = false;
  @Output() addTreatmentForTooth = new EventEmitter<{
    toothNumber: string;
    toothLabel: string;
  }>();

  // Pieza que el formulario de tratamiento (nuevo o edición) tiene cargada
  // ahora mismo — se resalta acá para que el odontograma quede en sincro con
  // el formulario sin importar si la pieza se eligió clickeando el diente o
  // desde el select "Pieza Dental" del formulario.
  @Input() selectedToothNumber: string | null = null;

  // Vista previa en vivo: mientras el formulario de tratamiento (nuevo o
  // edición) tiene un Diagnóstico elegido para selectedToothNumber, se
  // muestra ese color en la pieza antes de guardar — nada se persiste acá,
  // es solo lo que ya está tipeado en el form. Si se cancela sin guardar, el
  // color vuelve solo al que tiene guardado porque este input deja de
  // pasarse (ver ficha-clinica.component.html).
  @Input() previewStatus: ToothStatus | null = null;

  // false cuando se embebe dentro de Ficha Clínica: el botón propio de
  // "Guardar observaciones" se oculta, porque esas observaciones pasan a
  // guardarse junto con "Guardar Ficha" (ver ficha-clinica.component.ts).
  @Input() showObservationsSaveButton = true;

  pacientes: any[] = [];
  selectedPatientId: string | null = null;

  odontogram: Odontogram | null = null;
  hasNoOdontogram = false;
  isLoading = false;
  isSaving = false;

  generalObservations = '';

  readonly upperRight = UPPER_RIGHT;
  readonly upperLeft = UPPER_LEFT;
  readonly lowerRight = LOWER_RIGHT;
  readonly lowerLeft = LOWER_LEFT;

  readonly legendEntries = (
    Object.keys(STATUS_COLORS) as ToothStatus[]
  ).map((status) => ({ status, color: STATUS_COLORS[status] }));

  private toothLabels = new Map<string, string>();

  constructor(
    private pacienteService: PacienteService,
    private odontogramaService: OdontogramaService,
    private selectedPatientService: SelectedPatientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.buildToothLabels();
    if (this.showPatientSelector) {
      this.loadPacientes();
    }

    // Sincroniza con el paciente elegido desde el tab de Ficha Clínica (Historia Clínica).
    this.selectedPatientService.selectedPatientId.subscribe((patientId) => {
      if (patientId && patientId !== this.selectedPatientId) {
        this.selectedPatientId = patientId;
        this.onPatientChange();
      }
    });

    // El odontograma del paciente actual cambió desde el tab de Ficha Clínica
    // (al completar un tratamiento) — recargar para reflejarlo sin recargar la página.
    this.selectedPatientService.odontogramUpdated.subscribe(() => {
      if (this.selectedPatientId) {
        this.loadOdontogram();
      }
    });
  }

  private buildToothLabels(): void {
    (dentalPieces as { label: string; options: DentalPieceOption[] }[]).forEach(
      (group) => {
        group.options.forEach((option) => {
          if (/^\d{2}$/.test(option.value)) {
            this.toothLabels.set(option.value, option.label);
          }
        });
      },
    );
  }

  loadPacientes(): void {
    this.pacienteService
      .getPacientes()
      .then((response: any) => {
        this.pacientes = response.patients ?? [];
      })
      .catch((error: any) => {
        console.error('Error al cargar pacientes desde la API:', error);
      });
  }

  onPatientChange(): void {
    this.odontogram = null;
    this.hasNoOdontogram = false;
    if (this.selectedPatientId) {
      this.selectedPatientService.setSelectedPatient(this.selectedPatientId);
      this.loadOdontogram();
    }
  }

  loadOdontogram(): void {
    if (!this.selectedPatientId) return;
    this.isLoading = true;
    this.odontogramaService
      .getByPatient(this.selectedPatientId)
      .then((odontogram) => {
        this.odontogram = odontogram;
        this.generalObservations = odontogram.generalObservations ?? '';
        this.hasNoOdontogram = false;
      })
      .catch((error: any) => {
        if (error?.status === 404) {
          this.hasNoOdontogram = true;
        } else {
          this.snackBar.open('Error al cargar el odontograma', 'Cerrar', {
            duration: 3000,
          });
        }
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  crearOdontograma(): void {
    if (!this.selectedPatientId) return;
    this.isSaving = true;
    this.odontogramaService
      .createOdontograma(this.selectedPatientId)
      .then((odontogram) => {
        this.odontogram = odontogram;
        this.hasNoOdontogram = false;
        this.snackBar.open('Odontograma creado correctamente', 'Cerrar', {
          duration: 2500,
        });
      })
      .catch(() => {
        this.snackBar.open('Error al crear el odontograma', 'Cerrar', {
          duration: 3000,
        });
      })
      .finally(() => {
        this.isSaving = false;
      });
  }

  getTooth(toothNumber: string): ToothState | undefined {
    return this.odontogram?.teeth.find((t) => t.toothNumber === toothNumber);
  }

  getToothColor(toothNumber: string): string {
    if (
      this.selectedToothNumber === toothNumber &&
      this.previewStatus &&
      STATUS_COLORS[this.previewStatus]
    ) {
      return STATUS_COLORS[this.previewStatus];
    }
    const tooth = this.getTooth(toothNumber);
    return tooth ? STATUS_COLORS[tooth.status] : '#E0E0E0';
  }

  getToothLabel(toothNumber: string): string {
    return this.toothLabels.get(toothNumber) ?? toothNumber;
  }

  openToothDialog(toothNumber: string): void {
    if (this.treatmentMode) {
      this.addTreatmentForTooth.emit({
        toothNumber,
        toothLabel: this.getToothLabel(toothNumber),
      });
      return;
    }

    this.openStatusDialog(toothNumber);
  }

  // Segundo punto de entrada al mismo flujo que el clic principal (abre el
  // alta de tratamiento con la pieza precargada) — stopPropagation evita que
  // el clic también dispare el handler del .tooth-slot padre.
  onChangeStatusClick(event: MouseEvent, toothNumber: string): void {
    event.stopPropagation();
    this.openToothDialog(toothNumber);
  }

  private openStatusDialog(toothNumber: string): void {
    const tooth = this.getTooth(toothNumber);
    if (!this.odontogram || !tooth || !this.selectedPatientId) return;

    const dialogRef = this.dialog.open(ToothDialogComponent, {
      width: '420px',
      data: {
        toothNumber,
        toothLabel: this.getToothLabel(toothNumber),
        status: tooth.status,
        observations: tooth.observations,
      } as ToothDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || !this.selectedPatientId) return;
      this.odontogramaService
        .updateTooth(this.selectedPatientId, toothNumber, result)
        .then((odontogram) => {
          this.odontogram = odontogram;
          this.snackBar.open('Pieza actualizada correctamente', 'Cerrar', {
            duration: 2000,
          });
        })
        .catch(() => {
          this.snackBar.open('Error al actualizar la pieza', 'Cerrar', {
            duration: 3000,
          });
        });
    });
  }

  guardarObservacionesGenerales(showFeedback = true): void {
    if (!this.selectedPatientId || !this.odontogram) return;
    this.isSaving = true;
    this.odontogramaService
      .updateGeneralObservations(this.selectedPatientId, this.generalObservations)
      .then((odontogram) => {
        this.odontogram = odontogram;
        if (showFeedback) {
          this.snackBar.open('Observaciones guardadas', 'Cerrar', {
            duration: 2000,
          });
        }
      })
      .catch(() => {
        if (showFeedback) {
          this.snackBar.open('Error al guardar las observaciones', 'Cerrar', {
            duration: 3000,
          });
        }
      })
      .finally(() => {
        this.isSaving = false;
      });
  }
}
