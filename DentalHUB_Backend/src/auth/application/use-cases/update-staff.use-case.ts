import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { UpdateStaffDto } from '../dto/update-staff-auth.dto';
import { AuthMapper } from '../mappers/auth.mapper';
import { Role } from '../../../shared/enums/role.enum';

@Injectable()
export class UpdateStaffUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(id: string, dto: UpdateStaffDto, requesterRole: Role) {
    const target = await this.authRepository.findById(id);
    if (!target) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    const touchesSuperAdmin =
      target.role === Role.SUPER_ADMIN || dto.role === Role.SUPER_ADMIN;
    if (touchesSuperAdmin && requesterRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Solo un SUPER_ADMIN puede editar o asignar el rol SUPER_ADMIN',
      );
    }

    const updated = await this.authRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }
    return { user: AuthMapper.toResponse(updated) };
  }
}
