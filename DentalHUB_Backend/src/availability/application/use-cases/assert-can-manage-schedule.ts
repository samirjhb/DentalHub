import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../../shared/enums/role.enum';

const ADMIN_ROLES = [Role.SUPER_ADMIN, Role.CLINIC_ADMIN];

// RolesGuard solo verifica el rol, no ownership del recurso — un DENTIST
// solo puede editar su propio horario; SUPER_ADMIN/CLINIC_ADMIN pueden editar
// el de cualquiera (mismo criterio que el resto de la gestión de staff).
export function assertCanManageSchedule(
  dentistId: string,
  requesterId: string,
  requesterRole: Role,
): void {
  if (ADMIN_ROLES.includes(requesterRole)) return;
  if (requesterRole === Role.DENTIST && requesterId === dentistId) return;
  throw new ForbiddenException('No puedes editar el horario de otro odontólogo');
}
