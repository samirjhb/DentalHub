import { Routes } from '@angular/router';

// ui
import { AppChipsComponent } from './chips/chips.component';
import { AppListsComponent } from './lists/lists.component';
import { AppMenuComponent } from './menu/menu.component';
import { AppTooltipsComponent } from './tooltips/tooltips.component';
import { AppChatComponent } from './tables/tables.component';
import { PacienteComponent } from 'src/app/components/paciente/paciente.component';
import { HistoriaClinicaComponent } from 'src/app/components/historia-clinica/historia-clinica.component';
import { AgendaComponent } from 'src/app/components/agenda/agenda.component';

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'historia-clinica',
        component: HistoriaClinicaComponent,
      },
      {
        path: 'agenda',
        component: AgendaComponent,
      },
      {
        path: 'chips',
        component: AppChipsComponent,
      },
      {
        path: 'lists',
        component: AppListsComponent,
      },
      {
        path: 'menu',
        component: AppMenuComponent,
      },
      {
        path: 'tooltips',
        component: AppTooltipsComponent,
      },
      {
        path: 'paciente',
        component: PacienteComponent,
      },
      {
        path: 'chat',
        component: AppChatComponent,
      },
    ],
  },
];
