import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BrandLogoComponent } from 'src/app/shared/components/brand-logo/brand-logo.component';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { Role } from 'src/app/core/auth/enums/role.enum';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  icon: string;
  value: string;
  label: string;
}

// Página pública en '/' — quien ya tiene sesión no debería ver el marketing,
// se manda directo a su home (mismo criterio de redirect que side-login).
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, TablerIconsModule, BrandLogoComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();

  readonly stats: Stat[] = [
    { icon: 'layout-grid-add', value: '8', label: 'módulos integrados en una sola app' },
    { icon: 'device-mobile', value: '1', label: 'portal exclusivo para tus pacientes' },
    { icon: 'shield-lock', value: '100%', label: 'acceso controlado por rol' },
  ];

  readonly features: FeatureCard[] = [
    {
      icon: 'calendar-event',
      title: 'Agenda de citas',
      description: 'Programa, confirma y reprograma citas por odontólogo, sin choques de horario.',
      color: '#5d87ff',
    },
    {
      icon: 'file-text',
      title: 'Ficha e Historia Clínica',
      description: 'Diagnósticos, tratamientos y odontograma interactivo en un mismo lugar.',
      color: '#13deb9',
    },
    {
      icon: 'cash',
      title: 'Cobranza',
      description: 'Registra pagos y controla el saldo pendiente por paciente y por tratamiento.',
      color: '#fa896b',
    },
    {
      icon: 'box',
      title: 'Inventario',
      description: 'Controla el stock de insumos y recibe alertas cuando algo se está agotando.',
      color: '#9c27b0',
    },
    {
      icon: 'chart-bar',
      title: 'Reportes',
      description: 'Ingresos, tratamientos realizados y nuevos pacientes, siempre a la mano.',
      color: '#2196f3',
    },
    {
      icon: 'pill',
      title: 'Prescripciones',
      description: 'Genera recetas digitales directamente desde la ficha del paciente.',
      color: '#ff9800',
    },
    {
      icon: 'device-mobile',
      title: 'Portal de Pacientes',
      description: 'Tus pacientes agendan, cancelan y revisan su historial y facturación por su cuenta.',
      color: '#5d87ff',
    },
    {
      icon: 'shield-lock',
      title: 'Roles y permisos',
      description: 'Cada perfil (admin, dentista, recepción) ve solo la información que le corresponde.',
      color: '#13deb9',
    },
  ];

  readonly steps: Step[] = [
    {
      number: 1,
      icon: 'clipboard-text',
      title: 'Registra a tus pacientes',
      description: 'Carga la ficha de cada paciente con sus datos, RUT y antecedentes.',
    },
    {
      number: 2,
      icon: 'calendar-event',
      title: 'Agenda y atiende',
      description: 'Organiza el día por odontólogo y registra cada tratamiento en la ficha clínica.',
    },
    {
      number: 3,
      icon: 'report-money',
      title: 'Cobra y controla',
      description: 'Registra pagos, controla inventario y sigue el desempeño con reportes reales.',
    },
  ];

  constructor(
    private sessionManager: SessionManagerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.sessionManager.hasToken()) {
      const isPatient = this.sessionManager.getRole() === Role.PATIENT;
      this.router.navigate([isPatient ? '/portal-paciente/mis-citas' : '/dashboard']);
    }
  }
}
