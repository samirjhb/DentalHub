import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../shared/enums/role.enum';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class FindStaffQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar personal por rol (ej. DENTIST para el selector de la Agenda)',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description:
      'Excluir un rol del listado (ej. PATIENT para la pantalla de Administración). Mutuamente excluyente con role.',
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role)
  excludeRole?: Role;
}
