import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { AppointmentMapper } from '../mappers/appointment.mapper';

const DEFAULT_DURATION_MINUTES = 60;

@Injectable()
export class CreateAppointmentUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(dto: CreateAppointmentDto) {
    const patientExists = await this.repository.verifyPatientExists(
      dto.patient,
    );
    if (!patientExists) {
      throw new NotFoundException(
        `Paciente con ID ${dto.patient} no encontrado`,
      );
    }

    const dentistExists = await this.repository.verifyDentistExists(
      dto.dentist,
    );
    if (!dentistExists) {
      throw new NotFoundException(
        `Odontólogo con ID ${dto.dentist} no encontrado`,
      );
    }

    const durationMinutes = dto.durationMinutes ?? DEFAULT_DURATION_MINUTES;
    const startAt = new Date(dto.startAt);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);

    const overlaps = await this.repository.findOverlapping(
      dto.dentist,
      startAt,
      endAt,
    );
    if (overlaps) {
      throw new BadRequestException(
        'El odontólogo ya tiene una cita agendada en ese horario',
      );
    }

    const created = await this.repository.create({
      patient: dto.patient,
      dentist: dto.dentist,
      startAt,
      endAt,
      durationMinutes,
      reason: dto.reason,
      observations: dto.observations,
    });
    return AppointmentMapper.toResponse(created);
  }
}
