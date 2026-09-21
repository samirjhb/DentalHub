import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityMapper } from '../mappers/availability.mapper';
import { UpsertWeeklyScheduleDto } from '../dto/upsert-weekly-schedule.dto';
import { Role } from '../../../shared/enums/role.enum';
import { assertCanManageSchedule } from './assert-can-manage-schedule';

@Injectable()
export class UpsertWeeklyScheduleUseCase {
  constructor(private readonly repository: AvailabilityRepository) {}

  async execute(
    dentistId: string,
    dto: UpsertWeeklyScheduleDto,
    requesterId: string,
    requesterRole: Role,
  ) {
    assertCanManageSchedule(dentistId, requesterId, requesterRole);

    const dentistExists = await this.repository.verifyDentistExists(dentistId);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${dentistId} no encontrado`);
    }

    const schedule = await this.repository.upsertSchedule(dentistId, dto.blocks);
    return AvailabilityMapper.scheduleToResponse(schedule);
  }
}
