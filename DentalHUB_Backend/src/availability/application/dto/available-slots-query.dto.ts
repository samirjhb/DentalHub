import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';

export class AvailableSlotsQueryDto {
  @ApiProperty({ description: 'ID del odontólogo (usuario con rol DENTIST)' })
  @IsMongoId()
  dentistId: string;

  @ApiProperty({ description: 'Fecha a consultar (ISO 8601, solo se usa la parte de fecha)' })
  @IsDateString()
  date: string;

  // @Type(() => Number) es necesario porque llega como query string y el
  // ValidationPipe global no tiene `transform: true` (mismo criterio que
  // PaginationQueryDto para page/limit).
  @ApiPropertyOptional({ description: 'Duración deseada de la cita en minutos', default: 60 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
