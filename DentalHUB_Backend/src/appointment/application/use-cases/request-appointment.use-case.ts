import { Injectable } from '@nestjs/common';
import { CreateAppointmentUseCase } from './create-appointment.use-case';
import { RequestAppointmentDto } from '../dto/request-appointment.dto';

@Injectable()
export class RequestAppointmentUseCase {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
  ) {}

  async execute(patientId: string, dto: RequestAppointmentDto) {
    return this.createAppointmentUseCase.execute({
      patient: patientId,
      dentist: dto.dentist,
      startAt: dto.startAt,
      durationMinutes: dto.durationMinutes,
      reason: dto.reason,
    });
  }
}
