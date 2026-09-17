import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { AppointmentMapper } from '../mappers/appointment.mapper';

@Injectable()
export class RescheduleAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(id: string, dto: RescheduleAppointmentDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }

    const durationMinutes = dto.durationMinutes ?? existing.durationMinutes;
    const startAt = new Date(dto.startAt);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);

    const overlaps = await this.repository.findOverlapping(
      String(existing.dentist),
      startAt,
      endAt,
      id,
    );
    if (overlaps) {
      throw new BadRequestException(
        'El odontólogo ya tiene otra cita agendada en ese horario',
      );
    }

    const updated = await this.repository.reschedule(
      id,
      startAt,
      endAt,
      durationMinutes,
    );
    return AppointmentMapper.toResponse(updated!);
  }
}
