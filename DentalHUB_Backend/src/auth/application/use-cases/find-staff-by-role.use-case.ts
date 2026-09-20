import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthMapper } from '../mappers/auth.mapper';
import { FindStaffQueryDto } from '../dto/find-staff-query.dto';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindStaffByRoleUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(query: FindStaffQueryDto = {}) {
    const { role, excludeRole } = query;

    if (isPaginationRequested(query)) {
      const { page, limit, skip } = resolvePagination(query);
      const [users, total] = await Promise.all([
        this.authRepository.findByRole(role, excludeRole, skip, limit),
        this.authRepository.countStaff(role, excludeRole),
      ]);
      return buildPaginatedResult(
        users.map((u) => AuthMapper.toResponse(u)),
        total,
        page,
        limit,
      );
    }

    const users = await this.authRepository.findByRole(role, excludeRole);
    return { staff: users.map((u) => AuthMapper.toResponse(u)) };
  }
}
