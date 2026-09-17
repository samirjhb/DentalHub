import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID del paciente' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ description: 'ID del usuario (rol DENTIST) que atiende la cita' })
  @IsMongoId()
  dentist: string;

  @ApiProperty({ description: 'Fecha y hora de inicio (ISO 8601)' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ description: 'Duración en minutos', default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiProperty({ description: 'Motivo de la consulta' })
  @IsString()
  @MinLength(1)
  reason: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observations?: string;
}
