import { Routes } from '@angular/router';

import { PacienteComponent } from './paciente/paciente.component';
import { HistoriaClinicaComponent } from './historia-clinica/historia-clinica.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ChatComponent } from './chat/chat.component';
import { BillingComponent } from './billing/billing.component';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { Role } from '../core/auth/enums/role.enum';

const STAFF_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

const CLINICAL_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

// Manejar dinero no es rol de HYGIENIST/DENTAL_ASSISTANT — a diferencia de
// CLINICAL_ROLES, donde sí tienen lectura de datos clínicos. Mismo criterio
// ya usado en billing.controller.ts (backend).
const FINANCIAL_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
];

// Archivo de composición de rutas (no una feature única): agrupa bajo
// /herramientas-de-trabajo/* las pantallas de varias features, preservando
// el mismo lazy-chunk/prefijo de URL que tenía ui-components.routes.ts.
export const ToolsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'historia-clinica',
        component: HistoriaClinicaComponent,
        canActivate: [RoleGuard],
        data: { roles: CLINICAL_ROLES },
      },
      {
        path: 'agenda',
        component: AgendaComponent,
        canActivate: [RoleGuard],
        data: { roles: STAFF_ROLES },
      },
      {
        path: 'paciente',
        component: PacienteComponent,
        canActivate: [RoleGuard],
        data: { roles: STAFF_ROLES },
      },
      {
        path: 'chat',
        component: ChatComponent,
        canActivate: [RoleGuard],
        data: { roles: STAFF_ROLES },
      },
      {
        path: 'cobranza',
        component: BillingComponent,
        canActivate: [RoleGuard],
        data: { roles: FINANCIAL_ROLES },
      },
    ],
  },
];
