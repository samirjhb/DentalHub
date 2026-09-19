import { Injectable } from '@nestjs/common';
import { FindAllAppointmentsUseCase } from './find-all-appointments.use-case';
import { FilterMyAppointmentDto } from '../dto/filter-my-appointment.dto';

@Injectable()
export class FindMyAppointmentsUseCase {
  constructor(
    private readonly findAllAppointmentsUseCase: FindAllAppointmentsUseCase,
  ) {}

  async execute(patientId: string, filter: FilterMyAppointmentDto) {
    return this.findAllAppointmentsUseCase.execute({
      patient: patientId,
      status: filter.status,
      startDate: filter.startDate,
      endDate: filter.endDate,
    });
  }
}
