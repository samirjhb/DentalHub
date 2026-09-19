import { Routes } from '@angular/router';
import { BlankComponent } from './core/layout/blank/blank.component';
import { FullComponent } from './core/layout/full/full.component';
import { PatientPortalLayoutComponent } from './core/layout/patient-portal/patient-portal-layout.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { RoleGuard } from './core/auth/guards/role.guard';
import { Role } from './core/auth/enums/role.enum';
import { LandingComponent } from './features/landing/landing.component';

// Todo el mundo salvo PATIENT — el dashboard clínico (KPIs de toda la
// clínica) no es parte del Portal de Pacientes.
const STAFF_ROLES_ALL = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

export const routes: Routes = [
  // Va primero a propósito: para la URL raíz exacta ('/'), Angular resuelve
  // el PRIMER bloque de nivel superior cuyo `path` sea '' — sin intentar
  // "caer" al siguiente bloque aunque este no tenga hijos que matcheen. Si el
  // bloque de FullComponent fuera primero, se quedaría con '/' sin importar
  // que no tenga un child para path vacío, y su AuthGuard rebotaría a
  // cualquier visitante anónimo antes de que la landing pública pudiera
  // mostrarse. Por eso la landing (sin guard) va en el primer bloque.
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LandingComponent,
      },
      {
        path: 'authentication',
        loadChildren: () =>
          import('./features/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [RoleGuard],
        data: { roles: STAFF_ROLES_ALL },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DashboardRoutes),
      },
      {
        path: 'herramientas-de-trabajo',
        loadChildren: () =>
          import('./features/tools.routes').then((m) => m.ToolsRoutes),
      },
    ],
  },
  {
    path: 'portal-paciente',
    component: PatientPortalLayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/portal-paciente/portal-paciente.routes').then(
        (m) => m.PortalPacienteRoutes,
      ),
  },
  {
    // Antes redirigía a 'authentication/error', una ruta inexistente (bug
    // preexistente) — mismo destino que usa RoleGuard al bloquear una ruta.
    path: '**',
    redirectTo: '/dashboard',
  },
];
