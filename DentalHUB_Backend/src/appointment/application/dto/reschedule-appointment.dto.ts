import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ description: 'Nueva fecha y hora de inicio (ISO 8601)' })
  @IsDateString()
  startAt: string;

  @ApiPropertyOptional({ description: 'Nueva duración en minutos (si cambia)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
