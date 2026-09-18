import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

// Compartido por los 4 endpoints de reportes — todos reciben el mismo par de
// query params, no hay razón para duplicar 4 DTOs casi idénticos.
export class ReportsDateRangeDto {
  @ApiPropertyOptional({ description: 'Filtra desde esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filtra hasta esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
