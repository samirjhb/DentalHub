import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { AppointmentStatus } from '../../domain/entities/appointment-status.enum';
import { Appointment } from '../../domain/entities/appointment.entity';
import { AppointmentMapper } from '../mappers/appointment.mapper';

// Regla simple: el paciente solo puede cancelar, no reprogramar. Una cita ya
// en curso/terminada/cancelada no puede volver a cancelarse.
const CANCELABLE_STATUSES = [
  AppointmentStatus.PENDIENTE,
  AppointmentStatus.CONFIRMADA,
];

@Injectable()
export class CancelMyAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  // La cita ya llega cargada y verificada por AppointmentOwnershipGuard.
  async execute(appointment: Appointment) {
    if (!CANCELABLE_STATUSES.includes(appointment.status)) {
      throw new BadRequestException(
        `No se puede cancelar una cita en estado "${appointment.status}"`,
      );
    }
    const updated = await this.repository.updateStatus(
      String(appointment._id),
      AppointmentStatus.CANCELADA,
    );
    return AppointmentMapper.toResponse(updated!);
  }
}
