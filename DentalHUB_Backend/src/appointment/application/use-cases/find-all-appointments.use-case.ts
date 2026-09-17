import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../../domain/repositories/appointment.repository';
import { FilterAppointmentDto } from '../dto/filter-appointment.dto';
import { AppointmentMapper } from '../mappers/appointment.mapper';

@Injectable()
export class FindAllAppointmentsUseCase {
  constructor(private readonly repository: AppointmentRepository) {}

  async execute(filter: FilterAppointmentDto) {
    const appointments = await this.repository.findAll({
      dentist: filter.dentist,
      patient: filter.patient,
      status: filter.status,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    });
    return { appointments: appointments.map((a) => AppointmentMapper.toResponse(a)) };
  }
}
