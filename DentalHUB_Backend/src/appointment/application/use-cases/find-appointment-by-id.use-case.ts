import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { AppointmentMapper } from '../mappers/appointment.mapper';

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string) {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return AppointmentMapper.toResponse(appointment);
  }
}
