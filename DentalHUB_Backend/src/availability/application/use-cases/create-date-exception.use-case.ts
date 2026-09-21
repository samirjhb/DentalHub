import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityMapper } from '../mappers/availability.mapper';
import { CreateDateExceptionDto } from '../dto/create-date-exception.dto';
import { Role } from '../../../shared/enums/role.enum';
import { assertCanManageSchedule } from './assert-can-manage-schedule';

@Injectable()
export class CreateDateExceptionUseCase {
  constructor(private readonly repository: AvailabilityRepository) {}

  async execute(
    dentistId: string,
    dto: CreateDateExceptionDto,
    requesterId: string,
    requesterRole: Role,
  ) {
    assertCanManageSchedule(dentistId, requesterId, requesterRole);

    const dentistExists = await this.repository.verifyDentistExists(dentistId);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${dentistId} no encontrado`);
    }

    const date = new Date(dto.date);
    date.setUTCHours(0, 0, 0, 0);

    const exception = await this.repository.createException(dentistId, {
      date,
      allDay: dto.allDay,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });
    return AvailabilityMapper.exceptionToResponse(exception);
  }
}
