import { NavItem } from './nav-item/nav-item';
import { Role } from '../../../auth/enums/role.enum';

const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

const CLINICAL_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

// Manejar dinero no es rol de HYGIENIST/DENTAL_ASSISTANT — mismo criterio
// que FINANCIAL_ROLES en tools.routes.ts (backend en billing.controller.ts).
const FINANCIAL_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
];

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
    roles: STAFF_ROLES,
  },
  {
    displayName: 'Agenda',
    iconName: 'calendar',
    route: '/herramientas-de-trabajo/agenda',
    roles: STAFF_ROLES,
  },
  {
    displayName: 'Historia Clínica',
    iconName: 'file-text',
    route: '/herramientas-de-trabajo/historia-clinica',
    roles: CLINICAL_ROLES,
  },
  {
    displayName: 'Chat',
    iconName: 'robot',
    route: '/herramientas-de-trabajo/chat',
    roles: STAFF_ROLES,
  },
  {
    displayName: 'Cobranza',
    iconName: 'cash',
    route: '/herramientas-de-trabajo/cobranza',
    roles: FINANCIAL_ROLES,
  },

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
