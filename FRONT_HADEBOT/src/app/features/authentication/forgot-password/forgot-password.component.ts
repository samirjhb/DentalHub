import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandLogoComponent],
  templateUrl: './forgot-password.component.html',
})
export class AppForgotPasswordComponent {
  // El backend responde siempre el mismo mensaje genérico (exista o no el
  // email) para no revelar qué cuentas existen — el frontend solo lo muestra,
  // sin distinguir casos.
  submitted = false;
  isSubmitting = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  async sendResetLink() {
    if (!this.form.valid || this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      await this.authService.forgotPasswordService(this.form.value.email!);
      this.submitted = true;
    } catch (error: any) {
      this.showErrorAlert(error.message || 'Error al solicitar el enlace de recuperación');
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
