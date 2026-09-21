import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityMapper } from '../mappers/availability.mapper';

@Injectable()
export class ListDateExceptionsUseCase {
  constructor(private readonly repository: AvailabilityRepository) {}

  async execute(dentistId: string) {
    const dentistExists = await this.repository.verifyDentistExists(dentistId);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${dentistId} no encontrado`);
    }

    const exceptions = await this.repository.findExceptionsByDentist(dentistId);
    return exceptions.map((e) => AvailabilityMapper.exceptionToResponse(e));
  }
}
