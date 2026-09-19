import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { ThemeService } from 'src/app/core/layout/services/theme.service';

// Layout propio y mínimo para el Portal de Pacientes — no reutiliza FullComponent
// (el layout de staff): su sidebar y la ruta /dashboard no filtran hoy por rol
// de forma completa, así que mezclar audiencias ahí sería más frágil que un
// layout explícito y pequeño para PATIENT.
@Component({
  selector: 'app-patient-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, TablerIconsModule, BrandLogoComponent],
  templateUrl: './patient-portal-layout.component.html',
  styleUrls: ['./patient-portal-layout.component.css'],
})
export class PatientPortalLayoutComponent {
  theme = this.themeService.theme;

  navLinks = [
    { label: 'Mis citas', route: '/portal-paciente/mis-citas', icon: 'calendar' },
    { label: 'Mi historial', route: '/portal-paciente/mi-historial', icon: 'file-text' },
    { label: 'Mi facturación', route: '/portal-paciente/mi-facturacion', icon: 'cash' },
  ];

  constructor(
    private authService: AuthService,
    private sessionManager: SessionManagerService,
    private themeService: ThemeService,
    private router: Router,
  ) {}

  get email(): string | null {
    return this.sessionManager.getEmail();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/authentication/login']);
  }
}
