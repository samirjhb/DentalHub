import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { UpdateAppointmentStatusDto } from '../dto/update-appointment-status.dto';
import { AppointmentMapper } from '../mappers/appointment.mapper';

@Injectable()
export class UpdateAppointmentStatusUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string, dto: UpdateAppointmentStatusDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    const updated = await this.repository.updateStatus(id, dto.status);
    return AppointmentMapper.toResponse(updated!);
  }
}
