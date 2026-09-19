import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../../shared/enums/role.enum';

const STAFF_ROLES = [
  Role.SUPER_ADMIN,
  Role.CLINIC_ADMIN,
  Role.RECEPTIONIST,
  Role.DENTIST,
  Role.HYGIENIST,
  Role.DENTAL_ASSISTANT,
];

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  name?: string;

  @ApiPropertyOptional({ enum: STAFF_ROLES })
  @IsOptional()
  @IsEnum(Role)
  @IsIn(STAFF_ROLES)
  role?: Role;
}
