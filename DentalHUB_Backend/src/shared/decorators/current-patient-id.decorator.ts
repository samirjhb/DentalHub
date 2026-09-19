import {
  ForbiddenException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

// Extrae el patientId del JWT (nunca de query/param/body) para los endpoints
// `/me` del Portal de Pacientes. Si el usuario tiene role PATIENT pero aún no
// fue vinculado por el staff a un registro Patient, el JWT no trae `patientId`
// (ver TokenIssuerService) y se rechaza explícitamente en vez de dejar pasar
// un filtro `undefined` que devolvería datos de todos los pacientes.
export const CurrentPatientId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const patientId = request.user?.patientId;
    if (!patientId) {
      throw new ForbiddenException('PATIENT_NOT_LINKED');
    }
    return patientId;
  },
);
