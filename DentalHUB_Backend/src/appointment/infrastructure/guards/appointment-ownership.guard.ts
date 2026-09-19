import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';

// Solo aplica a rutas donde el :id de la URL es una cita (no un paciente), por
// lo que el ownership no puede derivarse directamente del JWT: hay que cargar
// la cita y comparar. Deja la cita ya cargada en `request.appointment` para
// que el use case no tenga que volver a buscarla.
@Injectable()
export class AppointmentOwnershipGuard implements CanActivate {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const appointmentId = request.params.id;
    const patientId = request.user?.patientId;

    if (!patientId) {
      throw new ForbiddenException('PATIENT_NOT_LINKED');
    }

    const appointment = await this.appointmentRepository.findById(
      appointmentId,
    );
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${appointmentId} no encontrada`);
    }

    if (String(appointment.patient) !== String(patientId)) {
      throw new ForbiddenException('No puedes acceder a una cita de otro paciente');
    }

    request.appointment = appointment;
    return true;
  }
}
