import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { AppointmentMapper } from '../mappers/appointment.mapper';
import { VerifyDentistAvailabilityUseCase } from '../../../availability/application/use-cases/verify-dentist-availability.use-case';

@Injectable()
export class RescheduleAppointmentUseCase {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly verifyDentistAvailability: VerifyDentistAvailabilityUseCase,
  ) {}

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

    const isAvailable = await this.verifyDentistAvailability.execute(
      String(existing.dentist),
      startAt,
      endAt,
    );
    if (!isAvailable) {
      throw new BadRequestException(
        'El horario seleccionado está fuera del horario de atención del odontólogo o corresponde a un día bloqueado',
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
