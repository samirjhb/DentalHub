import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Extrae el rol del usuario autenticado desde el JWT — usado para chequeos de
// jerarquía (p. ej. solo SUPER_ADMIN puede gestionar otra cuenta SUPER_ADMIN).
export const CurrentUserRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Role => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.role;
  },
);
