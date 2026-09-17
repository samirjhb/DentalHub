import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../shared/enums/role.enum';

export class FindStaffQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar personal por rol (ej. DENTIST para el selector de la Agenda)',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
