import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Inicio',
  },
  {
    displayName: 'Dashboard',
    iconName: 'layout-grid-add',
    route: '/dashboard',
  },

  {
    navCap: 'Herramientas de Trabajo',
  },
  {
    displayName: 'Paciente',
    iconName: 'clipboard-text',
    route: '/herramientas-de-trabajo/paciente',
  },
  {
    displayName: 'Ficha Clínica',
    iconName: 'file-text',
    route: '/herramientas-de-trabajo/fichaClinica',
  },
  {
    displayName: 'Chat',
    iconName: 'robot',
    route: '/herramientas-de-trabajo/chat',
  },
  // {
  //   displayName: 'Chips',
  //   iconName: 'info-circle',
  //   route: '/herramientas-de-trabajo/chips',
  // },
  // {
  //   displayName: 'Listas',
  //   iconName: 'list-details',
  //   route: '/herramientas-de-trabajo/lists',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'file-text-ai',
  //   route: '/herramientas-de-trabajo/tooltips',
  // },
  // {
  //   displayName: 'Tablas',
  //   iconName: 'table',
  //   route: '/herramientas-de-trabajo/tables',
  // },

  {
    navCap: 'Autenticación',
  },
  {
    displayName: 'Iniciar Sesión',
    iconName: 'login',
    route: '/authentication/login',
  },
  {
    displayName: 'Registrarse',
    iconName: 'user-plus',
    route: '/authentication/register',
  },
];
