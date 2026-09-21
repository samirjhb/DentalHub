import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Matches, Max, Min } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleBlockDto {
  @ApiProperty({ description: 'Día de la semana (0 = domingo ... 6 = sábado)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Hora de inicio, formato 24h "HH:mm"', example: '09:00' })
  @Matches(TIME_PATTERN, { message: 'startTime debe tener formato HH:mm' })
  startTime: string;

  @ApiProperty({ description: 'Hora de término, formato 24h "HH:mm"', example: '13:00' })
  @Matches(TIME_PATTERN, { message: 'endTime debe tener formato HH:mm' })
  endTime: string;
}
