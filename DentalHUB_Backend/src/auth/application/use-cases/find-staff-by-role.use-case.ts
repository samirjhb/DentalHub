import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthMapper } from '../mappers/auth.mapper';
import { Role } from '../../../shared/enums/role.enum';

@Injectable()
export class FindStaffByRoleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(role?: Role) {
    const users = await this.authRepository.findByRole(role);
    return { staff: users.map((u) => AuthMapper.toResponse(u)) };
  }
}
