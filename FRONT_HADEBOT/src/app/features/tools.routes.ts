import { Routes } from '@angular/router';

import { PacienteComponent } from './paciente/paciente.component';
import { HistoriaClinicaComponent } from './historia-clinica/historia-clinica.component';
import { AgendaComponent } from './agenda/agenda.component';
import { ChatComponent } from './chat/chat.component';
import { BillingComponent } from './billing/billing.component';
import { InventarioComponent } from './inventario/inventario.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AdministracionComponent } from './administracion/administracion.component';
import { MiHorarioComponent } from './mi-horario/mi-horario.component';
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

// Métricas de gestión, no operativas — mismo criterio que TOTAL_BALANCE_ROLES
// de billing.controller.ts (backend en reports.controller.ts).
const REPORTS_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

// Crear personal y ver la nómina completa es exclusivo de administración —
// mismo criterio que @Roles(SUPER_ADMIN, CLINIC_ADMIN) en POST /auth/staff
// (backend en auth.controller.ts).
const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

// El propio odontólogo gestiona su horario; RECEPTIONIST solo lo consume
// indirectamente vía el selector de horarios al agendar, no lo edita acá.
const SCHEDULE_MANAGE_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN, Role.DENTIST];

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
        path: 'mi-horario',
        component: MiHorarioComponent,
        canActivate: [RoleGuard],
        data: { roles: SCHEDULE_MANAGE_ROLES },
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
      {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [RoleGuard],
        data: { roles: STAFF_ROLES },
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [RoleGuard],
        data: { roles: REPORTS_ROLES },
      },
      {
        path: 'administracion',
        component: AdministracionComponent,
        canActivate: [RoleGuard],
        data: { roles: ADMIN_ROLES },
      },
    ],
  },
];
