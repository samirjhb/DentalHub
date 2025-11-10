import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule, NgIf } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { PacienteService } from 'src/app/services/paciente.service';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { MatTableDataSource } from '@angular/material/table';

// Interfaz para los datos de la tabla de pacientes
export interface PacienteData {
  _id: string;
  name: string;
  rut: string;
  email: string;
  cel: string;
  record: string;
  birthDate: Date;
  status: string;
}

// Datos de ejemplo para la tabla
const PACIENTES_EJEMPLO: PacienteData[] = [];

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css'],
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
    JsonPipe,
    NgIf,
    MatIconModule,
    TablerIconsModule,
    DirectivesModule,
    MatSnackBarModule,
    MatTableModule,
    MatMenuModule,
    MatProgressBarModule,
    MatPaginatorModule
],
})

export class PacienteComponent implements OnInit {
  pacienteForm: FormGroup;
  maxDate: Date = new Date();
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;
  currentPacienteId: string | null = null;
  formTitle: string = 'Registro de Paciente';

  // Datos para la tabla de pacientes
  displayedColumns: string[] = ['name', 'rut', 'contact', 'status', 'actions'];
  dataSource!: MatTableDataSource<PacienteData>;
  pacientes: PacienteData[] = [];
  isLoading: boolean = false;

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.pacienteForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required]],  // El patrón se validará en la directiva
      cel: ['', [Validators.required, Validators.pattern(/^569\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      record: [''],
      birthDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Cargar la lista de pacientes al inicializar el componente
    this.loadPacientes();
  }

  // Método para cargar la lista de pacientes
  loadPacientes() {
    this.isLoading = true;

    // Simulamos una carga de datos
    setTimeout(() => {
      try {
        // Intentamos obtener los datos de la API
        this.pacienteService.getPacientes()
          .then((data: any) => {
            this.pacientes = data.patients;
            this.initializeDataSource();
            this.isLoading = false;
          })
          .catch((error: any) => {
            // Si hay un error, usamos los datos de ejemplo
            console.error('Error al cargar pacientes desde la API:', error);
            this.pacientes = PACIENTES_EJEMPLO;
            this.initializeDataSource();
            this.isLoading = false;
          });
      } catch (error) {
        // Si hay un error en la llamada, usamos los datos de ejemplo
        console.error('Error al intentar cargar pacientes:', error);
        this.pacientes = PACIENTES_EJEMPLO;
        this.initializeDataSource();
        this.isLoading = false;
      }
    }, 1000); // Simulamos un retraso de 1 segundo para mostrar el indicador de carga
  }

  // Inicializar el dataSource con los datos y configurar el paginador
  initializeDataSource() {
    this.dataSource = new MatTableDataSource<PacienteData>(this.pacientes);

    // Configurar opciones de paginación después de que Angular termine de renderizar la vista
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;

        // Traducir textos del paginador
        this.paginator._intl.itemsPerPageLabel = 'Pacientes por página:';
        this.paginator._intl.nextPageLabel = 'Página siguiente';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
          }
          length = Math.max(length, 0);
          const startIndex = page * pageSize;
          const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} de ${length}`;
        };
      }
    });
  }

  async onSubmit() {
    if (this.pacienteForm.valid) {
      this.isSubmitting = true;
      console.log('Estado de edición:', { isEditMode: this.isEditMode, currentPacienteId: this.currentPacienteId });

      try {
        if (this.isEditMode && this.currentPacienteId) {
          console.log('Ejecutando modo de EDICIÓN para paciente ID:', this.currentPacienteId);
          // Modo edición - actualizar paciente existente
          console.log('Datos a enviar para actualización:', this.pacienteForm.value);
          await this.pacienteService.updatePaciente(this.currentPacienteId, this.pacienteForm.value)
            .then(response => {
              console.log('Paciente actualizado:', response);

              // Mostrar mensaje de éxito
              this.snackBar.open(
                'Paciente actualizado exitosamente',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );

              // Limpiar el formulario y resetear el modo
              this.resetForm();

              // Recargar la lista de pacientes
              this.loadPacientes();

              // Desplazarse a la tabla
              document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
              console.error('Error al actualizar el paciente:', error);

              // Mostrar mensaje de error
              this.snackBar.open(
                error.error?.message || 'Error al actualizar el paciente. Intente nuevamente.',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                }
              );
            });
        } else {
          // Modo creación - crear nuevo paciente
          console.log('Ejecutando modo de CREACIÓN de paciente');
          console.log('Datos a enviar para creación:', this.pacienteForm.value);
          await this.pacienteService.createPaciente(this.pacienteForm.value)
            .then(response => {
              console.log('Paciente creado:', response);

              // Mostrar mensaje de éxito
              this.snackBar.open(
                'Paciente registrado exitosamente',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );

              // Limpiar el formulario
              this.resetForm();

              // Recargar la lista de pacientes
              this.loadPacientes();

              // Desplazarse a la tabla
              document.querySelector('table')?.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(error => {
              console.error('Error al crear el paciente:', error);

              // Mostrar mensaje de error
              this.snackBar.open(
                error.error?.message || 'Error al registrar el paciente. Intente nuevamente.',
                'Cerrar',
                {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                }
              );
            });
        }
      } catch (error: any) {
        console.error('Error en la operación del paciente:', error);

        // Mostrar mensaje de error
        this.snackBar.open(
          error.error?.message || 'Error al procesar el paciente. Intente nuevamente.',
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
      Object.keys(this.pacienteForm.controls).forEach(key => {
        const control = this.pacienteForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.pacienteForm.get(controlName);
    
    if (control?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control?.hasError('email')) {
      return 'Por favor ingrese un correo electrónico válido';
    }
    
    if (control?.hasError('minlength')) {
      return `Debe tener al menos ${control.getError('minlength').requiredLength} caracteres`;
    }
    
    if (control?.hasError('pattern')) {
      if (controlName === 'cel') {
        return 'Formato de celular inválido. Debe comenzar con 569 seguido de 8 dígitos';
      }
    }
    
    if (control?.hasError('invalidRut')) {
      return 'Formato de RUT inválido. Ej: 12.345.678-9';
    }
    
    return '';
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
    this.pacienteForm.reset();
    this.isEditMode = false;
    this.currentPacienteId = null;
    this.formTitle = 'Registro de Paciente';
    console.log('Estado después de resetear:', { isEditMode: this.isEditMode, currentPacienteId: this.currentPacienteId });
  }

  // Método para editar un paciente
  async editarPaciente(paciente: PacienteData) {
    try {
      console.log('Editar paciente:', paciente);
      this.isEditMode = true;
      this.currentPacienteId = paciente._id;
      this.formTitle = 'Editar Paciente';
      
      // Intentar obtener los datos más recientes del paciente desde el backend
      try {
        const pacienteActualizado = await this.pacienteService.getPacienteById(paciente._id);
        console.log('Datos actualizados del paciente:', pacienteActualizado);
        
        // Si se obtienen los datos del backend, usarlos para llenar el formulario
        if (pacienteActualizado) {
          this.pacienteForm.patchValue({
            name: pacienteActualizado.name,
            rut: pacienteActualizado.rut,
            cel: pacienteActualizado.cel,
            email: pacienteActualizado.email,
            record: pacienteActualizado.record,
            birthDate: new Date(pacienteActualizado.birthDate)
          });
        }
      } catch (error) {
        console.error('Error al obtener datos del paciente desde el backend:', error);
        
        // Si hay error al obtener los datos del backend, usar los datos locales
        this.pacienteForm.patchValue({
          name: paciente.name,
          rut: paciente.rut,
          cel: paciente.cel,
          email: paciente.email,
          record: paciente.record,
          birthDate: paciente.birthDate
        });
      }
      
      // Desplazarse al formulario
      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
      
      // Mostrar mensaje
      this.snackBar.open('Editando paciente: ' + paciente.name, 'Cerrar', {
        duration: 3000
      });
    } catch (error) {
      console.error('Error al preparar la edición del paciente:', error);
      this.snackBar.open('Error al preparar la edición del paciente', 'Cerrar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Método para eliminar un paciente
  eliminarPaciente(id: string) {
    // Buscar el paciente para mostrar su nombre en el diálogo
    const paciente = this.pacientes.find(p => p._id === id);
    const nombrePaciente = paciente ? paciente.name : 'este paciente';
    
    // Abrir diálogo de confirmación personalizado
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Confirmar eliminación',
        message: `¿Está seguro que desea eliminar a ${nombrePaciente}?`,
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
          this.pacienteService.deletePaciente(id)
            .then(() => {
              this.snackBar.open('Paciente eliminado exitosamente', 'Cerrar', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
              this.loadPacientes();
            })
            .catch((error: any) => {
              console.error('Error al eliminar paciente:', error);
              
              // Si hay error en la API, simulamos la eliminación en el frontend
              this.pacientes = this.pacientes.filter(p => p._id !== id);
              this.initializeDataSource();
              
              this.snackBar.open(
                'Paciente eliminado (simulado)', 
                'Cerrar', 
                {
                  duration: 5000,
                  panelClass: ['success-snackbar']
                }
              );
            });
        } catch (error) {
          console.error('Error al intentar eliminar paciente:', error);
          
          // Simulamos la eliminación en el frontend
          this.pacientes = this.pacientes.filter(p => p._id !== id);
          this.initializeDataSource();
          
          this.snackBar.open(
            'Paciente eliminado (simulado)', 
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
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CL');
  }
}
