import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Extrae el id del usuario autenticado (staff o paciente) desde el JWT —
// mismo criterio que CurrentPatientId: nunca confiar en un id que mande el
// cliente en el body para campos de auditoría como "registeredBy".
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
