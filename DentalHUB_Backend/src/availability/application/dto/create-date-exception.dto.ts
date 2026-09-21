import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateDateExceptionDto {
  @ApiProperty({ description: 'Fecha bloqueada (ISO 8601, solo se usa la parte de fecha)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Si es true, bloquea el día completo (ignora startTime/endTime)' })
  @IsBoolean()
  allDay: boolean;

  @ApiPropertyOptional({ description: 'Hora de inicio del bloqueo parcial, "HH:mm" (requerido si allDay=false)' })
  @ValidateIf((dto: CreateDateExceptionDto) => !dto.allDay)
  @Matches(TIME_PATTERN, { message: 'startTime debe tener formato HH:mm' })
  startTime?: string;

  @ApiPropertyOptional({ description: 'Hora de término del bloqueo parcial, "HH:mm" (requerido si allDay=false)' })
  @ValidateIf((dto: CreateDateExceptionDto) => !dto.allDay)
  @Matches(TIME_PATTERN, { message: 'endTime debe tener formato HH:mm' })
  endTime?: string;

  @ApiPropertyOptional({ description: 'Motivo del bloqueo (ej. "Vacaciones", "Feriado")' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  reason?: string;
}
