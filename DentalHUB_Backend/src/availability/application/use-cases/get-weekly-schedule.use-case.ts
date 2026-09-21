import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from '../../domain/repositories/availability.repository';
import { AvailabilityMapper } from '../mappers/availability.mapper';

@Injectable()
export class GetWeeklyScheduleUseCase {
  constructor(private readonly repository: AvailabilityRepository) {}

  async execute(dentistId: string) {
    const dentistExists = await this.repository.verifyDentistExists(dentistId);
    if (!dentistExists) {
      throw new NotFoundException(`Odontólogo con ID ${dentistId} no encontrado`);
    }

    const schedule = await this.repository.findScheduleByDentist(dentistId);
    if (!schedule) {
      // Todavía no configuró horario — se devuelve un horario vacío en vez
      // de 404, es un estado válido (ver VerifyDentistAvailabilityUseCase).
      return { dentist: dentistId, blocks: [] };
    }
    return AvailabilityMapper.scheduleToResponse(schedule);
  }
}
