import { Routes } from '@angular/router';
import { BlankComponent } from './core/layout/blank/blank.component';
import { FullComponent } from './core/layout/full/full.component';
import { AuthGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
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
    path: '',
    component: BlankComponent,
    children: [
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
    // Antes redirigía a 'authentication/error', una ruta inexistente (bug
    // preexistente) — mismo destino que usa RoleGuard al bloquear una ruta.
    path: '**',
    redirectTo: '/dashboard',
  },
];
