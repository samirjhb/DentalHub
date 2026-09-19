import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormGroup,
  FormControl,
  ValidationErrors,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';

// Validador de campo (no de grupo): así el error queda en `confirmPassword`
// mismo, que es lo que mat-form-field necesita para mostrar su `mat-error`
// (solo se muestra si el propio NgControl del input está inválido — un
// `*ngIf` a mano en el template no alcanza, Angular Material lo ignora).
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.parent?.get('newPassword')?.value;
  return control.value === newPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandLogoComponent],
  templateUrl: './reset-password.component.html',
})
export class AppResetPasswordComponent implements OnInit {
  isSubmitting = false;
  private token: string | null = null;

  form = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, passwordsMatchValidator]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    // Sin token no hay nada que hacer acá — de vuelta a pedir un link nuevo.
    if (!this.token) {
      this.router.navigate(['/authentication/forgot-password']);
      return;
    }

    // Si el usuario corrige "Nueva contraseña" después de haber llenado
    // "Confirmar contraseña", hay que revalidar esta última — el validador
    // de confirmPassword no se re-ejecuta solo con que cambie su hermano.
    this.form.controls.newPassword.valueChanges.subscribe(() => {
      this.form.controls.confirmPassword.updateValueAndValidity();
    });
  }

  async reset() {
    if (!this.form.valid || !this.token || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      await this.authService.resetPasswordService(this.token, this.form.value.newPassword!);
      this.snackBar.open('Contraseña actualizada. Ya puedes iniciar sesión.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
      this.router.navigate(['/authentication/login']);
    } catch (error: any) {
      this.showErrorAlert(error.message || 'Error al restablecer la contraseña');
    } finally {
      this.isSubmitting = false;
    }
  }

  showErrorAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
