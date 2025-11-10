import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { SessionManagerService } from 'src/app/services/session-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
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
        const response: any = await this.authService.loginService(this.form.value);
        
        // If login was successful and we have a token, navigate to dashboard
        if (response && response.token) {
          this.router.navigate(['/dashboard']);
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
}
