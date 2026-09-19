import { Routes } from '@angular/router';
import { MisCitasComponent } from './mis-citas/mis-citas.component';
import { MiHistorialComponent } from './mi-historial/mi-historial.component';
import { MiFacturacionComponent } from './mi-facturacion/mi-facturacion.component';
import { RoleGuard } from '../../core/auth/guards/role.guard';
import { Role } from '../../core/auth/enums/role.enum';

export const PortalPacienteRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'mis-citas',
        pathMatch: 'full',
      },
      {
        path: 'mis-citas',
        component: MisCitasComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.PATIENT] },
      },
      {
        path: 'mi-historial',
        component: MiHistorialComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.PATIENT] },
      },
      {
        path: 'mi-facturacion',
        component: MiFacturacionComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.PATIENT] },
      },
    ],
  },
];
