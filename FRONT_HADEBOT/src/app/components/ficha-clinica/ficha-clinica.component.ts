import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FichaClinicaService, ClinicalRecord, CreateClinicalRecordDto, DentalTreatment, AddTreatmentDto, UpdateStatusDto, AddDepositDto, UpdateAppointmentDateDto, FilterClinicalRecordDto } from 'src/app/services/ficha-clinica.service';
import { PacienteService } from 'src/app/services/paciente.service';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { DepositDialogComponent } from '../dialogs/deposit-dialog/deposit-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { PdfService } from 'src/app/services/pdf.service';
import dentalPieces from 'src/assets/i18n/dental-pieces.json';
import { ImageViewerDialogComponent } from '../shared/image-viewer-dialog/image-viewer-dialog.component';

// Interfaz para los datos de la tabla de fichas clínicas adaptada al modelo del backend
export interface FichaClinicaData {
  _id: string;
  patient: any; // Para mostrar en la tabla necesitamos el objeto completo
  treatments: DentalTreatment[];
  attachments?: string[];
  dentist: string;
  createdAt: Date;
  updatedAt: Date;
  // Campos calculados para la tabla
  totalPrice?: number;
  totalDeposit?: number;
  totalBalance?: number;
  balance?: number;
  percentagePaid?: number;
  nextAppointment?: Date;
  overallStatus?: string;
}

// Inicializamos con un array vacío, los datos vendrán del backend
const FICHAS_EJEMPLO: FichaClinicaData[] = [];

@Component({
  selector: 'app-ficha-clinica',
  templateUrl: './ficha-clinica.component.html',
  styleUrls: ['./ficha-clinica.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    NgIf,
    NgFor,
    MatIconModule,
    TablerIconsModule,
    DirectivesModule,
    MatSnackBarModule,
    MatTableModule,
    MatMenuModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatStepperModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule
  ],
})
export class FichaClinicaComponent implements OnInit {
  // Propiedades para manejar las imágenes de radiografía
  radiographyFiles: File[] = [];
  radiographyPreviews: string[] = [];
  radiographyBase64: string[] = [];
  fichaClinicaForm: FormGroup;
  treatmentForm: FormGroup;
  maxDate: Date = new Date();
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;
  
  // Variables para el selector de fecha y hora
  selectedHour: number = new Date().getHours();
  selectedMinute: number = new Date().getMinutes();
  selectedDateTemp: Date | null = null;
  selectedTreatmentIndex: number | null = null;
  currentFichaId: string | null = null;
  formTitle: string = 'Registro de Ficha Clínica';
  showTreatmentForm: boolean = false;
  currentTreatmentIndex: number | null = null;
  isDetailView: boolean = false;
  dentalPieces: any[] = [];
  selectedFicha: FichaClinicaData | null = null;

  // Variables para filtrado
  statusFilter: string = '';

  // Datos para la tabla de fichas clínicas
  displayedColumns: string[] = ['paciente', 'treatments', 'totalPrice', 'nextAppointment', 'generalStatus', 'actions'];
  dataSource!: MatTableDataSource<FichaClinicaData>;
  fichas: FichaClinicaData[] = [];
  isLoading: boolean = false;

  // Lista de pacientes para el selector
  pacientes: any[] = [];

  // Estados disponibles para las fichas clínicas
  estados: string[] = ['Pendiente', 'En proceso', 'Completado', 'Cancelado'];

  // Filtros
  filterForm: FormGroup;

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Dentista actual (en una aplicación real, esto vendría del servicio de autenticación)
  currentDentist: string = 'dentista_default';

  // Mapa de colores para el odontograma
  statusColors = {
    'Pendiente': '#FFC107',
    'En proceso': '#2196F3',
    'Completado': '#4CAF50',
    'Cancelado': '#F44336'
  };

  constructor(
    private fb: FormBuilder,
    private fichaClinicaService: FichaClinicaService,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private pdfService: PdfService
  ) { }

  // Inicializar el formulario principal de ficha clínica
  initForm() {
    // Formulario principal para la ficha clínica
    this.fichaClinicaForm = this.fb.group({
      patient: ['', Validators.required],
      attachments: [[]],
      treatments: this.fb.array([])
    });

    // Formulario para filtros
    this.filterForm = this.fb.group({
      patient: [''],
      dentist: [''],
      status: [''],
      startDate: [null],
      endDate: [null]
    });

    // Formulario para un tratamiento individual
    this.initTreatmentForm();
  }

  // Inicializar el formulario de tratamiento
  initTreatmentForm(treatment?: DentalTreatment) {
    this.treatmentForm = this.fb.group({
      diagnosis: [treatment?.diagnosis || '', Validators.required],
      radiography: [treatment?.radiography || ''],
      toothNumber: [treatment?.toothNumber || '', Validators.required],
      treatment: [treatment?.treatment || '', Validators.required],
      price: [treatment?.price || '', [Validators.required, Validators.min(0)]],
      deposit: [treatment?.deposit || 0, [Validators.min(0)]],
      appointmentDate: [treatment?.appointmentDate ? new Date(treatment.appointmentDate) : null],
      status: [treatment?.status || 'Pendiente', Validators.required],
      observations: [treatment?.observations || '']
    });
  }

  // Getter para acceder al FormArray de tratamientos
  get treatments() {
    return this.fichaClinicaForm.get('treatments') as FormArray;
  }

  // Método para eliminar un tratamiento
  removeTreatment(index: number) {
    this.treatments.removeAt(index);
  }

  ngOnInit(): void {
    this.dentalPieces = dentalPieces;
    this.initForm();
    this.loadPacientes();
    this.loadFichasClinicas();
    // En una aplicación real, obtendríamos el ID del dentista del servicio de autenticación
    // Por ahora, usamos un valor por defecto
    this.getCurrentDentist();
  }

  // Método para obtener el dentista actual (simulado)
  getCurrentDentist(): void {
    // En una aplicación real, esto vendría del servicio de autenticación
    // Por ahora, usamos un valor por defecto
    this.currentDentist = 'dentista_default';
  }

  // Método para cargar la lista de fichas clínicas
  loadFichasClinicas() {
    this.isLoading = true;
    try {
      this.fichaClinicaService.getFichasClinicas()
        .then((response: any) => {
          console.log('Respuesta del servidor (fichas clínicas):', response);

          // Procesar los datos para calcular campos adicionales para la tabla
          this.fichas = response.map((record: any) => {
            // Calcular el precio total y abono total sumando todos los tratamientos
            const totalPrice = record.treatments.reduce((sum: number, t: any) => sum + t.price, 0);
            const totalDeposit = record.treatments.reduce((sum: number, t: any) => sum + t.deposit, 0);
            const balance = totalPrice - totalDeposit;
            const percentagePaid = totalPrice > 0 ? (totalDeposit / totalPrice) * 100 : 0;

            // Encontrar la próxima cita (la fecha más cercana en el futuro)
            const today = new Date();
            const futureAppointments = record.treatments
              .filter((t: any) => new Date(t.appointmentDate) >= today)
              .map((t: any) => new Date(t.appointmentDate));
            const nextAppointment = futureAppointments.length > 0
              ? new Date(Math.min(...futureAppointments.map((d: { getTime: () => any; }) => d.getTime())))
              : null;

            // Determinar el estado general basado en los estados de los tratamientos
            let overallStatus = 'Completado';
            if (record.treatments.some((t: any) => t.status === 'Pendiente')) {
              overallStatus = 'Pendiente';
            } else if (record.treatments.some((t: any) => t.status === 'En proceso')) {
              overallStatus = 'En proceso';
            } else if (record.treatments.some((t: any) => t.status === 'Cancelado') &&
              !record.treatments.some((t: any) => t.status === 'Completado' || t.status === 'En proceso')) {
              overallStatus = 'Cancelado';
            }

            return {
              _id: record._id,
              patient: record.patient,
              treatments: record.treatments.map((t: any) => ({
                ...t,
                appointmentDate: new Date(t.appointmentDate)
              })),
              attachments: record.attachments || [],
              dentist: record.dentist,
              createdAt: new Date(record.createdAt),
              updatedAt: new Date(record.updatedAt),
              // Campos calculados
              totalPrice,
              totalDeposit,
              balance,
              percentagePaid,
              nextAppointment,
              overallStatus
            };
          });

          console.log('Fichas clínicas procesadas:', this.fichas);
          this.initializeDataSource();
          this.isLoading = false;

          // Si hay un ID en la URL, cargar la ficha específica para vista detallada
          this.route.params.subscribe(params => {
            if (params['id']) {
              this.viewFichaDetail(params['id']);
            }
          });
        })
        .catch((error: any) => {
          console.error('Error al cargar fichas clínicas:', error);
          // Si hay error, mostramos un mensaje al usuario
          this.snackBar.open('Error al cargar fichas clínicas', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        });
    } catch (error) {
      console.error('Error al intentar cargar fichas clínicas:', error);
      this.snackBar.open('Error al cargar fichas clínicas', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.isLoading = false;
    }
  }

  // Método para filtrar fichas clínicas
  applyFilter() {
    this.isLoading = true;
    const filterData: FilterClinicalRecordDto = this.filterForm.value;

    // Eliminar propiedades vacías
    Object.keys(filterData).forEach(key => {
      if (!filterData[key as keyof FilterClinicalRecordDto]) {
        delete filterData[key as keyof FilterClinicalRecordDto];
      }
    });

    this.fichaClinicaService.filterFichasClinicas(filterData)
      .then((response: any) => {
        // Procesar los datos igual que en loadFichasClinicas
        this.fichas = this.processFichasData(response);
        this.initializeDataSource();
        this.isLoading = false;
      })
      .catch((error: any) => {
        console.error('Error al filtrar fichas clínicas:', error);
        this.snackBar.open('Error al filtrar fichas clínicas', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      });
  }

  // Método para procesar los datos de fichas clínicas
  processFichasData(data: any[]): FichaClinicaData[] {
    return data.map((record: any) => {
      // Calcular el precio total y abono total sumando todos los tratamientos
      const totalPrice = record.treatments.reduce((sum: number, t: any) => sum + t.price, 0);
      const totalDeposit = record.treatments.reduce((sum: number, t: any) => sum + t.deposit, 0);
      const balance = totalPrice - totalDeposit;
      const percentagePaid = totalPrice > 0 ? (totalDeposit / totalPrice) * 100 : 0;

      // Encontrar la próxima cita (la fecha más cercana en el futuro)
      const today = new Date();
      const futureAppointments = record.treatments
        .filter((t: any) => new Date(t.appointmentDate) >= today && t.status !== 'Completado' && t.status !== 'Cancelado')
        .map((t: any) => new Date(t.appointmentDate));
      const nextAppointment = futureAppointments.length > 0
        ? new Date(Math.min(...futureAppointments.map((d: Date) => d.getTime())))
        : undefined;

      // Determinar el estado general basado en los estados de los tratamientos
      let overallStatus = 'Completado';
      if (record.treatments.some((t: any) => t.status === 'Pendiente')) {
        overallStatus = 'Pendiente';
      } else if (record.treatments.some((t: any) => t.status === 'En proceso')) {
        overallStatus = 'En proceso';
      } else if (record.treatments.some((t: any) => t.status === 'Cancelado') &&
        !record.treatments.some((t: any) => t.status === 'Completado' || t.status === 'En proceso')) {
        overallStatus = 'Cancelado';
      }

      return {
        _id: record._id,
        patient: record.patient,
        treatments: record.treatments.map((t: any) => ({
          ...t,
          appointmentDate: new Date(t.appointmentDate)
        })),
        attachments: record.attachments || [],
        dentist: record.dentist,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        // Campos calculados
        totalPrice,
        totalDeposit,
        balance,
        percentagePaid,
        nextAppointment,
        overallStatus
      };
    });
  }

  // Método para cargar la lista de pacientes
  loadPacientes() {
    try {
      this.pacienteService.getPacientes()
        .then((response) => {
          this.pacientes = response.patients;
          this.initializeDataSource();
          this.isLoading = false;
        })
        .catch((error: any) => {
          console.error('Error al cargar pacientes desde la API:', error);
          // Usar pacientes de ejemplo si hay error
          this.pacientes = [
            { _id: '1', name: 'Juan Pérez González' },
            { _id: '2', name: 'María Rodríguez López' },
            { _id: '3', name: 'Pedro Sánchez Martínez' }
          ];
        });
    } catch (error) {
      console.error('Error al intentar cargar pacientes:', error);
      // Usar pacientes de ejemplo si hay error
      this.pacientes = [
        { _id: '1', name: 'Juan Pérez González' },
        { _id: '2', name: 'María Rodríguez López' },
        { _id: '3', name: 'Pedro Sánchez Martínez' }
      ];
    }
  }

  // Inicializar el dataSource con los datos y configurar el paginador
  initializeDataSource() {
    this.dataSource = new MatTableDataSource<FichaClinicaData>(this.fichas);

    // Configurar opciones de paginación después de que Angular termine de renderizar la vista
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;

        // Traducir textos del paginador
        this.paginator._intl.itemsPerPageLabel = 'Fichas por página:';
        this.paginator._intl.nextPageLabel = 'Página siguiente';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
          }

          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
      }
    });
  }

  async onSubmit() {
    if (this.fichaClinicaForm.valid) {
      this.isSubmitting = true;
      console.log('Estado de edición:', { isEditMode: this.isEditMode, currentFichaId: this.currentFichaId });

      // Método para preparar los datos antes de enviar al backend
      const formData = this.prepareFormData();

      try {
        if (this.isEditMode && this.currentFichaId) {
          console.log('Ejecutando modo de EDICIÓN para ficha ID:', this.currentFichaId);
          // Modo edición - actualizar ficha existente
          console.log('Datos a enviar para actualización:', formData);
          await this.fichaClinicaService.updateFichaClinica(this.currentFichaId, formData)
            .then(response => {
              console.log('Ficha clínica actualizada:', response);

              // Mostrar mensaje de éxito
              this.snackBar.open(
                'Ficha clínica actualizada exitosamente',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );

              // Limpiar el formulario y resetear el modo
              this.resetForm();

              // Recargar la lista de fichas
              this.loadFichasClinicas();

              // Desplazarse a la tabla
              document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
              console.error('Error al actualizar la ficha clínica:', error);

              // Mostrar mensaje de error
              this.snackBar.open(
                error.error?.message || 'Error al actualizar la ficha clínica. Intente nuevamente.',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                }
              );
            });
        } else {
          // Modo creación - crear nueva ficha
          console.log('Ejecutando modo de CREACIÓN de ficha clínica');
          console.log('Datos a enviar para creación:', formData);
          await this.fichaClinicaService.createFichaClinica(formData)
            .then(response => {
              console.log('Ficha clínica creada:', response);

              // Mostrar mensaje de éxito
              this.snackBar.open(
                'Ficha clínica registrada exitosamente',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );

              // Limpiar el formulario
              this.resetForm();

              // Recargar la lista de fichas
              this.loadFichasClinicas();

              // Desplazarse a la tabla
              document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
              console.error('Error al crear la ficha clínica:', error);

              // Mostrar mensaje de error
              this.snackBar.open(
                error.error?.message || 'Error al registrar la ficha clínica. Intente nuevamente.',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                }
              );
            });
        }
      } catch (error: any) {
        console.error('Error en la operación de la ficha clínica:', error);

        // Mostrar mensaje de error
        this.snackBar.open(
          error.error?.message || 'Error al procesar la ficha clínica. Intente nuevamente.',
          'Cerrar',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      } finally {
        this.isSubmitting = false;
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched(this.fichaClinicaForm);
    }
  }

  // Método para preparar los datos antes de enviar al backend
  prepareFormData(): CreateClinicalRecordDto {
    const formData = this.fichaClinicaForm.value;

    // Crear el DTO para enviar al backend
    const clinicalRecordDto: CreateClinicalRecordDto = {
      patient: formData.patient,
      treatments: this.treatments.controls.map(control => {
        const treatment = control.value;
        return {
          diagnosis: treatment.diagnosis,
          radiography: treatment.radiography,
          toothNumber: treatment.toothNumber,
          treatment: treatment.treatment,
          price: treatment.price,
          deposit: treatment.deposit || 0,
          status: treatment.status,
          appointmentDate: treatment.appointmentDate ? new Date(treatment.appointmentDate) : undefined,
          observations: treatment.observations
        };
      }),
      attachments: formData.attachments || [],
      dentist: 'current-user-id' // En una implementación real, esto vendría del servicio de autenticación
    };

    return clinicalRecordDto;
  }

  // Método para marcar todos los campos de un formulario como tocados
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  getErrorMessage(field: string, form?: FormGroup): string {
    const formToUse = form || this.fichaClinicaForm;
    const control = formToUse.get(field);

    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (control?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }

    return 'Error de validación';
  }

  // Método para cancelar y volver atrás
  cancelar() {
    if (this.isEditMode) {
      // Si estamos en modo edición, solo resetear el formulario y volver al modo de creación
      this.resetForm();
    } else {
      // Si estamos en modo creación, volver al dashboard
      this.router.navigate(['/dashboard']);
    }
  }
  
  // Método para resetear el formulario y el modo de edición
  resetForm() {
    console.log('Reseteando formulario y modo de edición');
    this.fichaClinicaForm.reset({
      estado: 'pendiente',
      fechaAtencion: new Date(),
      precio: 0,
      abono: 0
    });
    this.treatmentForm.reset();
    this.isEditMode = false;
    this.currentFichaId = null;
    this.formTitle = 'Registro de Ficha Clínica';
    console.log('Estado después de resetear:', { isEditMode: this.isEditMode, currentFichaId: this.currentFichaId });
    
    // Limpiar el array de tratamientos
    while (this.treatments.length !== 0) {
      this.treatments.removeAt(0);
    }
    
    // Reiniciar el formulario de tratamiento
    this.initTreatmentForm();
    this.showTreatmentForm = false;
    this.currentTreatmentIndex = null;
  }

  // Método para ver el detalle de una ficha clínica
  viewFichaDetail(id: string) {
    this.isDetailView = true;
    this.isLoading = true;
    
    // Buscar la ficha en los datos locales primero
    const localFicha = this.fichas.find(f => f._id === id);
    
    if (localFicha) {
      this.selectedFicha = localFicha;
      this.isLoading = false;
    } else {
      // Si no se encuentra localmente, obtenerla del servidor
      this.fichaClinicaService.getFichaClinicaById(id)
        .then((response: any) => {
          // Procesar los datos para calcular campos adicionales
          const processedFicha = this.processFichasData([response])[0];
          this.selectedFicha = processedFicha;
          this.isLoading = false;
        })
        .catch((error: any) => {
          console.error('Error al obtener detalle de ficha clínica:', error);
          this.snackBar.open('Error al obtener detalle de ficha clínica', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
          this.isDetailView = false;
        });
    }
  }
  
  // Método para volver a la lista desde la vista detallada
  backToList() {
    this.isDetailView = false;
    this.selectedFicha = null;
  }

  // Método para editar una ficha clínica
  async editarFichaClinica(ficha: FichaClinicaData) {
    try {
      console.log('Editar ficha clínica:', ficha);
      this.isEditMode = true;
      this.currentFichaId = ficha._id;
      this.formTitle = 'Editar Ficha Clínica';
      
      // Intentar obtener los datos más recientes de la ficha desde el backend
      try {
        const fichaActualizada = await this.fichaClinicaService.getFichaClinicaById(ficha._id);
        console.log('Datos actualizados de la ficha clínica:', fichaActualizada);
        
        // Si se obtienen los datos del backend, usarlos para llenar el formulario
        if (fichaActualizada) {
          // Limpiar el array de tratamientos actual
          while (this.treatments.length !== 0) {
            this.treatments.removeAt(0);
          }
          
          // Llenar el formulario principal
          this.fichaClinicaForm.patchValue({
            patient: fichaActualizada.patient._id,
            attachments: fichaActualizada.attachments || []
          });
          
          // Agregar cada tratamiento al FormArray
          fichaActualizada.treatments.forEach((treatment: DentalTreatment) => {
            const treatmentGroup = this.fb.group({
              diagnosis: [treatment.diagnosis, Validators.required],
              radiography: [treatment.radiography || ''],
              toothNumber: [treatment.toothNumber, Validators.required],
              treatment: [treatment.treatment, Validators.required],
              price: [treatment.price, [Validators.required, Validators.min(0)]],
              deposit: [treatment.deposit || 0, [Validators.min(0)]],
              appointmentDate: [treatment.appointmentDate ? new Date(treatment.appointmentDate) : null],
              status: [treatment.status, Validators.required],
              observations: [treatment.observations || '']
            });
            
            this.treatments.push(treatmentGroup);
          });
        }
      } catch (error) {
        console.error('Error al obtener datos de la ficha desde el backend:', error);
        
        // Si hay error al obtener los datos del backend, usar los datos locales
        // Limpiar el array de tratamientos actual
        while (this.treatments.length !== 0) {
          this.treatments.removeAt(0);
        }
        
        // Llenar el formulario principal
        this.fichaClinicaForm.patchValue({
          patient: ficha.patient._id,
          attachments: ficha.attachments || []
        });
        
        // Agregar cada tratamiento al FormArray
        ficha.treatments.forEach((treatment: DentalTreatment) => {
          const treatmentGroup = this.fb.group({
            diagnosis: [treatment.diagnosis, Validators.required],
            radiography: [treatment.radiography || ''],
            toothNumber: [treatment.toothNumber, Validators.required],
            treatment: [treatment.treatment, Validators.required],
            price: [treatment.price, [Validators.required, Validators.min(0)]],
            deposit: [treatment.deposit || 0, [Validators.min(0)]],
            appointmentDate: [treatment.appointmentDate ? new Date(treatment.appointmentDate) : null],
            status: [treatment.status, Validators.required],
            observations: [treatment.observations || '']
          });
          
          this.treatments.push(treatmentGroup);
        });
      }
      
      // Desplazarse al formulario
      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
      
      // Mostrar mensaje
      this.snackBar.open('Editando ficha clínica', 'Cerrar', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error al preparar la edición de la ficha clínica:', error);
      this.snackBar.open('Error al preparar la edición de la ficha clínica', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  // Métodos para gestionar tratamientos individuales
  
  // Mostrar formulario para agregar un nuevo tratamiento
  showAddTreatmentForm() {
    this.initTreatmentForm();
    this.showTreatmentForm = true;
    this.currentTreatmentIndex = null;
  }
  
  // Mostrar formulario para editar un tratamiento existente
  editTreatment(index: number) {
    const treatment = (this.treatments.at(index) as FormGroup).value;
    this.initTreatmentForm(treatment);
    
    // Cargar las imágenes de radiografía si existen
    if (treatment.radiography && Array.isArray(treatment.radiography) && treatment.radiography.length > 0) {
      this.loadImagesFromBase64Array(treatment.radiography);
    } else {
      // Limpiar las imágenes anteriores
      this.clearRadiographyFiles();
    }
    
    this.showTreatmentForm = true;
    this.currentTreatmentIndex = index;
  }
  
  // Guardar un tratamiento (nuevo o editado)
  saveTreatment() {
    if (this.treatmentForm.valid) {
      const treatmentData = this.treatmentForm.value;
      
      if (this.currentTreatmentIndex !== null) {
        // Editar tratamiento existente
        this.treatments.at(this.currentTreatmentIndex).patchValue(treatmentData);
      } else {
        // Agregar nuevo tratamiento
        const treatmentGroup = this.fb.group({
          diagnosis: [treatmentData.diagnosis, Validators.required],
          radiography: [treatmentData.radiography || ''],
          toothNumber: [treatmentData.toothNumber, Validators.required],
          treatment: [treatmentData.treatment, Validators.required],
          price: [treatmentData.price, [Validators.required, Validators.min(0)]],
          deposit: [treatmentData.deposit || 0, [Validators.min(0)]],
          appointmentDate: [treatmentData.appointmentDate],
          status: [treatmentData.status, Validators.required],
          observations: [treatmentData.observations || '']
        });
        
        this.treatments.push(treatmentGroup);
      }
      
      // Ocultar formulario y resetear
      this.showTreatmentForm = false;
      this.currentTreatmentIndex = null;
      this.initTreatmentForm();
      
      // Mostrar mensaje
      this.snackBar.open(
        this.currentTreatmentIndex !== null ? 'Tratamiento actualizado' : 'Tratamiento agregado', 
        'Cerrar', 
        { duration: 3000 }
      );
    } else {
      // Marcar campos como tocados para mostrar errores
      this.markFormGroupTouched(this.treatmentForm);
    }
  }
  
  // Cancelar edición de tratamiento
  cancelTreatmentEdit() {
    this.showTreatmentForm = false;
    this.currentTreatmentIndex = null;
    this.initTreatmentForm();
  }
  
  // Agregar un abono a un tratamiento existente (en vista detallada)
  async addDeposit(treatmentIndex: number) {
    if (!this.selectedFicha) return;
    
    // Abrir diálogo para ingresar monto
    const dialogRef = this.dialog.open(DepositDialogComponent, {
      width: '400px',
      data: {
        title: 'Registrar Abono',
        message: 'Ingrese el monto del abono:',
        confirmText: 'Registrar',
        cancelText: 'Cancelar',
        icon: 'cash',
        iconColor: 'text-success',
        amount: 0
      }
    });
    
    dialogRef.afterClosed().subscribe(async (amount) => {
      if (amount) {
        if (amount <= 0) {
          this.snackBar.open('El monto debe ser mayor a cero', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          return;
        }
        
        try {
          if (this.selectedFicha) {
            const depositData: AddDepositDto = { amount };
            await this.fichaClinicaService.addTreatmentDeposit(
              this.selectedFicha._id, 
              treatmentIndex, 
              depositData
            );
            
            // Actualizar los datos locales primero
            if (this.selectedFicha && this.selectedFicha.treatments && this.selectedFicha.treatments[treatmentIndex]) {
              // Actualizar el depósito en el objeto seleccionado
              const currentDeposit = this.selectedFicha.treatments[treatmentIndex].deposit || 0;
              this.selectedFicha.treatments[treatmentIndex].deposit = currentDeposit + amount;
              
              // Actualizar también en el array de fichas si existe
              const fichaIndex = this.fichas.findIndex(f => f._id === this.selectedFicha?._id);
              if (fichaIndex !== -1 && this.fichas[fichaIndex].treatments && this.fichas[fichaIndex].treatments[treatmentIndex]) {
                const currentArrayDeposit = this.fichas[fichaIndex].treatments[treatmentIndex].deposit || 0;
                this.fichas[fichaIndex].treatments[treatmentIndex].deposit = currentArrayDeposit + amount;
                
                // Recalcular los totales para la ficha en el array
                const totalDeposit = this.fichas[fichaIndex].treatments.reduce((sum, t) => sum + (t.deposit || 0), 0);
                const totalPrice = this.fichas[fichaIndex].treatments.reduce((sum, t) => sum + (t.price || 0), 0);
                
                // Actualizar los valores calculados en la ficha
                this.fichas[fichaIndex].totalDeposit = totalDeposit;
                this.fichas[fichaIndex].balance = totalPrice - totalDeposit;
                this.fichas[fichaIndex].percentagePaid = totalPrice > 0 ? (totalDeposit / totalPrice) * 100 : 0;
              }
              
              // Recalcular los totales y porcentajes para la ficha seleccionada
              const recalculatedFicha = this.processFichasData([this.selectedFicha])[0];
              this.selectedFicha = recalculatedFicha;
              
              // Actualizar el dataSource de la tabla con los datos actualizados
              this.dataSource.data = [...this.fichas];
              
              // Si hay paginador, mantener la configuración
              if (this.paginator) {
                this.dataSource.paginator = this.paginator;
              }
              
              // Forzar detección de cambios
              this.cdr.detectChanges();
            }
            
            this.snackBar.open('Abono registrado exitosamente', 'Cerrar', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
          }
        } catch (error) {
          console.error('Error al registrar abono:', error);
          this.snackBar.open('Error al registrar abono', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }
  
  // Actualizar el estado de un tratamiento (en vista detallada)
  async updateTreatmentStatus(treatmentIndex: number, newStatus: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado') {
    if (!this.selectedFicha) return;
    
    try {
      const statusData: UpdateStatusDto = { status: newStatus };
      await this.fichaClinicaService.updateTreatmentStatus(
        this.selectedFicha._id, 
        treatmentIndex, 
        statusData
      );
      
      // Actualizar los datos locales primero
      if (this.selectedFicha && this.selectedFicha.treatments && this.selectedFicha.treatments[treatmentIndex]) {
        // Actualizar el estado en el objeto seleccionado
        this.selectedFicha.treatments[treatmentIndex].status = newStatus;
        
        // Actualizar también en el array de fichas si existe
        const fichaIndex = this.fichas.findIndex(f => f._id === this.selectedFicha?._id);
        if (fichaIndex !== -1 && this.fichas[fichaIndex].treatments && this.fichas[fichaIndex].treatments[treatmentIndex]) {
          this.fichas[fichaIndex].treatments[treatmentIndex].status = newStatus;
        }
        
        // Recalcular los totales y porcentajes
        if (this.selectedFicha) {
          const recalculatedFicha = this.processFichasData([this.selectedFicha])[0];
          this.selectedFicha = recalculatedFicha;
        }
        
        // Actualizar el dataSource de la tabla
        this.initializeDataSource();
      }
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      this.snackBar.open('Error al actualizar estado', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }
  
  // Método para seleccionar la fecha (sin actualizar aún)
  selectDate(treatmentIndex: number, newDate: Date) {
    this.selectedDateTemp = newDate;
    this.selectedTreatmentIndex = treatmentIndex;
    
    // Inicializar la hora con la hora actual o con la hora de la cita existente
    if (this.selectedFicha && this.selectedFicha.treatments && this.selectedFicha.treatments[treatmentIndex]) {
      const currentDate = this.selectedFicha.treatments[treatmentIndex].appointmentDate;
      if (currentDate) {
        this.selectedHour = currentDate.getHours();
        this.selectedMinute = currentDate.getMinutes();
      } else {
        const now = new Date();
        this.selectedHour = now.getHours();
        this.selectedMinute = now.getMinutes();
      }
    } else {
      const now = new Date();
      this.selectedHour = now.getHours();
      this.selectedMinute = now.getMinutes();
    }
  }

  // Método para actualizar la hora seleccionada
  updateTime(treatmentIndex: number) {
    // Validar los valores de hora y minutos
    if (this.selectedHour < 0) this.selectedHour = 0;
    if (this.selectedHour > 23) this.selectedHour = 23;
    if (this.selectedMinute < 0) this.selectedMinute = 0;
    if (this.selectedMinute > 59) this.selectedMinute = 59;
    
    this.selectedTreatmentIndex = treatmentIndex;
  }

  // Método para confirmar la fecha y hora seleccionadas
  async confirmDateTime(treatmentIndex: number) {
    if (!this.selectedFicha || !this.selectedDateTemp) return;
    
    // Crear una nueva fecha con la fecha seleccionada y la hora especificada
    const newDateTime = new Date(this.selectedDateTemp);
    newDateTime.setHours(this.selectedHour, this.selectedMinute, 0);
    
    // Llamar al método de actualización con la nueva fecha y hora
    await this.updateAppointmentDate(treatmentIndex, newDateTime);
  }
  
  // Actualizar la fecha de cita de un tratamiento (en vista detallada)
  async updateAppointmentDate(treatmentIndex: number, newDate: Date) {
    if (!this.selectedFicha) return;
    
    try {
      const dateData: UpdateAppointmentDateDto = { date: newDate };
      await this.fichaClinicaService.updateTreatmentAppointmentDate(
        this.selectedFicha._id, 
        treatmentIndex, 
        dateData
      );
            // Actualizar los datos locales primero
      if (this.selectedFicha && this.selectedFicha.treatments && this.selectedFicha.treatments[treatmentIndex]) {
        // Actualizar la fecha en el objeto seleccionado
        this.selectedFicha.treatments[treatmentIndex].appointmentDate = newDate;
        
        // Actualizar también en el array de fichas si existe
        const fichaIndex = this.fichas.findIndex(f => f._id === this.selectedFicha?._id);
        if (fichaIndex !== -1 && this.fichas[fichaIndex].treatments && this.fichas[fichaIndex].treatments[treatmentIndex]) {
          this.fichas[fichaIndex].treatments[treatmentIndex].appointmentDate = newDate;
          
          // Recalcular la próxima cita para esta ficha
          const today = new Date();
          const futureAppointments = this.fichas[fichaIndex].treatments
            .filter(t => t.appointmentDate && new Date(t.appointmentDate) >= today && t.status !== 'Completado' && t.status !== 'Cancelado')
            .map(t => t.appointmentDate ? new Date(t.appointmentDate) : new Date());
          
          this.fichas[fichaIndex].nextAppointment = futureAppointments.length > 0
            ? new Date(Math.min(...futureAppointments.map((d: Date) => d.getTime())))
            : undefined;
        }
        
        // Recalcular los totales y porcentajes
        if (this.selectedFicha) {
          const recalculatedFicha = this.processFichasData([this.selectedFicha])[0];
          this.selectedFicha = recalculatedFicha;
        }
        
        // Actualizar el dataSource de la tabla
        this.initializeDataSource();
      }
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      this.snackBar.open('Fecha de cita actualizada exitosamente', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al actualizar fecha de cita:', error);
      this.snackBar.open('Error al actualizar fecha de cita', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Método para eliminar una ficha clínica
  eliminarFichaClinica(id: string) {
    // Buscar la ficha para mostrar información en el diálogo
    const ficha = this.fichas.find(f => f._id === id);
    const pacienteNombre = ficha?.patient.name || 'este paciente';
    
    // Abrir diálogo de confirmación personalizado
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar la ficha clínica de ${pacienteNombre}?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        icon: 'trash',
        iconColor: 'text-danger'
      }
    });

    // Manejar la respuesta del diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si el usuario confirmó la eliminación
        try {
          this.fichaClinicaService.deleteFichaClinica(id)
            .then(() => {
              this.snackBar.open('Ficha clínica eliminada exitosamente', 'Cerrar', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
              this.loadFichasClinicas();
            })
            .catch((error: any) => {
              console.error('Error al eliminar ficha clínica:', error);
              
              // Si hay error en la API, simulamos la eliminación en el frontend
              this.fichas = this.fichas.filter(f => f._id !== id);
              this.initializeDataSource();
              
              this.snackBar.open(
                'Ficha clínica eliminada (simulado)', 
                'Cerrar', 
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );
            });
        } catch (error) {
          console.error('Error al intentar eliminar ficha clínica:', error);
          
          // Simulamos la eliminación en el frontend
          this.fichas = this.fichas.filter(f => f._id !== id);
          this.initializeDataSource();
          
          this.snackBar.open(
            'Ficha clínica eliminada (simulado)', 
            'Cerrar', 
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
        }
      }
    });
  }

  // Método para formatear la fecha
  formatDate(date?: Date): string {
    if (!date) return '';
    const d = new Date(date);
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) return '';
    
    // Formatear la fecha con hora
    const fechaFormateada = d.toLocaleDateString('es-CL');
    const horaFormateada = d.getHours().toString().padStart(2, '0') + ':' + 
                          d.getMinutes().toString().padStart(2, '0');
    
    return `${fechaFormateada} ${horaFormateada}`;
  }

  // Método para formatear el precio
  formatPrice(price: number | undefined): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price || 0);
  }

  // Método para obtener el nombre del paciente por su ID
  getPacienteName(pacienteId: string): string {
    const paciente = this.pacientes.find(p => p._id === pacienteId);
    return paciente ? paciente.name : 'Paciente no encontrado';
  }

  // Método para calcular el saldo pendiente
  calcularSaldo(precio: number, abono: number): number {
    return precio - abono;
  }

  // Método para calcular el precio total de todos los tratamientos
  calculateTotalPrice(): number {
    return this.treatments.controls.reduce((sum, control) => sum + control.get('price')?.value || 0, 0);
  }

  // Método para calcular el total de abonos
  calculateTotalDeposit(): number {
    return this.treatments.controls.reduce((sum, control) => sum + (control.get('deposit')?.value || 0), 0);
  }
  
  // Método para obtener un resumen de los tratamientos
  getTreatmentsSummary(treatments: DentalTreatment[]): string {
    if (!treatments || treatments.length === 0) return 'Sin tratamientos';

    if (treatments.length === 1) {
      return treatments[0].treatment;
    }
    
    return `${treatments.length} tratamientos`;
  }
  
  // Método para calcular el porcentaje de completitud de los tratamientos
  getCompletionPercentage(treatments: DentalTreatment[]): number {
    if (!treatments || treatments.length === 0) return 0;
    const completedCount = this.getCompletedCount(treatments);
    return Math.round((completedCount / treatments.length) * 100);
  }
  
  // Método para obtener la cantidad de tratamientos completados
  getCompletedCount(treatments: DentalTreatment[]): number {
    if (!treatments) return 0;
    return treatments.filter(t => t.status === 'Completado').length;
  }
  
  // Método para verificar si algún tratamiento tiene observaciones
  hasAnyObservations(treatments: DentalTreatment[]): boolean {
    if (!treatments || treatments.length === 0) {
      return false;
    }
    return treatments.some(t => t.observations && t.observations.trim().length > 0);
  }
  
  // Verificar si hay radiografías en alguno de los tratamientos
  hasAnyRadiographs(treatments: DentalTreatment[]): boolean {
    if (!treatments || treatments.length === 0) {
      return false;
    }
    return treatments.some(t => t.radiography && Array.isArray(t.radiography) && t.radiography.length > 0);
  }
  
  // Abrir visor de imágenes para ver la radiografía en tamaño completo
  openImageViewer(imageUrl: string): void {
    // Crear un elemento de diálogo modal para mostrar la imagen
    const dialogRef = this.dialog.open(ImageViewerDialogComponent, {
      width: '80%',
      maxWidth: '1000px',
      data: { imageUrl }
    });
  }
  
  // Método para descargar una imagen en base64
  downloadImage(base64Data: string, fileName: string): void {
    try {
      // Crear un enlace temporal para la descarga
      const linkElement = document.createElement('a');
      
      // Preparar la URL de datos con el base64
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;
      
      // Configurar el enlace
      linkElement.href = dataUrl;
      linkElement.download = fileName;
      
      // Agregar el enlace al documento, hacer clic y luego eliminarlo
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      // Mostrar notificación de éxito
      this.snackBar.open(`Imagen ${fileName} descargada correctamente`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      this.snackBar.open('Error al descargar la imagen', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Método para calcular el porcentaje pagado
  getPaymentPercentage(deposit: number | undefined, price: number | undefined): number {
    if (!price || price === 0 || !deposit) return 0;
    return Math.round((deposit / price) * 100);
  }
  
  // Métodos para manejar las imágenes de radiografía
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    files.forEach(file => {
      if (!file.type.includes('image/')) {
        this.snackBar.open('Solo se permiten archivos de imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.radiographyFiles.push(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.radiographyPreviews.push(e.target.result);
        
        // Guardar como base64 para enviar al servidor
        const base64 = e.target.result.split(',')[1];
        this.radiographyBase64.push(base64);
        
        // Actualizar el campo de radiografía en el formulario
        this.updateRadiographyField();
        
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number) {
    // Guardar el nombre del archivo que estamos eliminando para informar al usuario
    const fileName = this.radiographyFiles[index]?.name || 'la imagen';
    
    // Eliminar la imagen de los arrays
    this.radiographyFiles.splice(index, 1);
    this.radiographyPreviews.splice(index, 1);
    this.radiographyBase64.splice(index, 1);
    
    // Actualizar el campo de radiografía en el formulario
    this.updateRadiographyField();
    
    // Notificar al usuario que la imagen se ha eliminado
    this.snackBar.open(`${fileName} ha sido eliminada`, 'Cerrar', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
    
    // Resetear el input de archivo para permitir seleccionar la misma imagen nuevamente
    const fileInput = document.getElementById('radiographyFiles') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    this.cdr.detectChanges();
  }

  clearRadiographyFiles() {
    this.radiographyFiles = [];
    this.radiographyPreviews = [];
    this.radiographyBase64 = [];
    
    // Actualizar el campo de radiografía en el formulario
    this.updateRadiographyField();
  }


  updateRadiographyField() {
    // Si estamos usando un campo oculto para almacenar las imágenes, actualizarlo
    if (this.treatmentForm.get('radiography')) {
      // Guardar el array de imágenes en base64
      this.treatmentForm.get('radiography')!.setValue(this.radiographyBase64);
    }
  }
  
  // Método para cargar imágenes desde un array de base64
  loadImagesFromBase64Array(base64Array: string[]) {
    if (!base64Array || !Array.isArray(base64Array) || base64Array.length === 0) {
      return;
    }
    
    // Limpiar las imágenes actuales
    this.clearRadiographyFiles();
    
    // Cargar cada imagen del array
    base64Array.forEach((base64String, index) => {
      // Crear la URL de la imagen para la vista previa
      const imageUrl = `data:image/jpeg;base64,${base64String}`;
      this.radiographyPreviews.push(imageUrl);
      
      // Guardar el base64 en el array
      this.radiographyBase64.push(base64String);
      
      // Crear un objeto File para cada imagen (opcional, solo si necesitas el objeto File)
      try {
        // Convertir base64 a blob
        const byteString = atob(base64String);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: 'image/jpeg' });
        const file = new File([blob], `imagen-${index + 1}.jpg`, { type: 'image/jpeg' });
        this.radiographyFiles.push(file);
      } catch (error) {
        console.error('Error al convertir base64 a File:', error);
      }
    });
    
    // Actualizar la interfaz
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Limpiar recursos si es necesario
    this.clearRadiographyFiles();
  }

  // Método para aplicar filtros a la tabla
  applyFilters() {
    // Filtrar por estado si se ha seleccionado uno
    if (this.statusFilter) {
      this.dataSource.filter = this.statusFilter;
      this.dataSource.filterPredicate = (data: FichaClinicaData, filter: string) => {
        // Verificar si algún tratamiento coincide con el estado filtrado
        return data.treatments.some(t => t.status === filter);
      };
    } else {
      this.dataSource.filter = '';
    }
  }

  // Método para generar un presupuesto en PDF
  generateBudget(ficha: FichaClinicaData) {
    // Usar la ruta estática del logo
    const logoUrl = 'assets/images/logos/logoHadebot.png';
    
    // Generar el PDF
    this.pdfService.generateBudgetPdf(ficha, logoUrl);
    
    // Mostrar mensaje de éxito
    this.snackBar.open(
      'Presupuesto generado correctamente', 
      'Cerrar', 
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }
}
