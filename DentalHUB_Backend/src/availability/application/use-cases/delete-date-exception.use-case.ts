import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { Role } from '../../../shared/enums/role.enum';
import { assertCanManageSchedule } from './assert-can-manage-schedule';

@Injectable()
export class DeleteDateExceptionUseCase {
  constructor(private readonly repository: AvailabilityRepository) {}

  async execute(
    dentistId: string,
    exceptionId: string,
    requesterId: string,
    requesterRole: Role,
  ): Promise<void> {
    assertCanManageSchedule(dentistId, requesterId, requesterRole);

    const deleted = await this.repository.deleteException(dentistId, exceptionId);
    if (!deleted) {
      throw new NotFoundException(`Excepción con ID ${exceptionId} no encontrada`);
    }
  }
}
