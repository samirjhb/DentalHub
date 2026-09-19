import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UpdateStaffDto } from '../dto/update-staff-auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';

@Injectable()
export class UpdateStaffUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(id: string, dto: UpdateStaffDto) {
    const updated = await this.authRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }
    return { user: AuthMapper.toResponse(updated) };
  }
}
