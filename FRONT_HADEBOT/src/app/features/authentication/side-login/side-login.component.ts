import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';
import { Role } from 'src/app/core/auth/enums/role.enum';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, BrandLogoComponent],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionManager: SessionManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Limpiar el token al entrar a la página de login
    this.sessionManager.clearToken();
  }

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  async login() {
    console.log(this.form.value);
    if (this.form.valid) {
      try {
        const response: any = await this.authService.loginService(this.form.value, () => {
          this.showRetryingAlert();
        });

        // If login was successful and we have a token, navigate to the
        // right home for this role — un PATIENT no tiene acceso al dashboard
        // clínico (ver RoleGuard/app.routes.ts).
        if (response && response.token) {
          const isPatient = this.sessionManager.getRole() === Role.PATIENT;
          this.router.navigate([isPatient ? '/portal-paciente/mis-citas' : '/dashboard']);
        }
      } catch (error: any) {
        console.error('Login failed:', error);
        
        // Display beautiful error pop-up
        this.showErrorAlert(error.message || 'Error en el inicio de sesión');
      }
    }
  }

  /**
   * Displays a beautiful error alert pop-up
   * @param message Error message to display
   */
  showErrorAlert(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Se dispara cuando el primer intento de login falla por status 0 (el
   * backend gratuito de Render aún está despertando) y el AuthService va a
   * reintentar automáticamente una vez.
   */
  showRetryingAlert() {
    this.snackBar.open('El servidor está iniciando, reintentando...', undefined, {
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
