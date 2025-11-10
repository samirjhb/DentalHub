import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from '../service/auth.service';
import { SessionManagerService } from 'src/app/services/session-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent implements OnInit {

  constructor(
    private authService: AuthService, 
    private router: Router,
    private sessionManager: SessionManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Limpiar el token al entrar a la página de registro
    this.sessionManager.clearToken();
  }

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  async register() {
    if (this.form.valid) {
      try {
        const response: any = await this.authService.registerService(this.form.value);
        
        // If registration was successful and we have a token, navigate to dashboard
        if (response && response.token) {
          this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.error('Registration failed:', error);
        
        // Display beautiful error pop-up
        this.showErrorAlert(error.message || 'Error en el registro');
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
