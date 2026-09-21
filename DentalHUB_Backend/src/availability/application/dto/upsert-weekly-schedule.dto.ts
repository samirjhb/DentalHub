import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { ScheduleBlockDto } from './schedule-block.dto';

export class UpsertWeeklyScheduleDto {
  @ApiProperty({ type: [ScheduleBlockDto], description: 'Reemplaza por completo el horario semanal del odontólogo' })
  @IsArray()
  @ArrayMaxSize(28) // 4 bloques como máximo por día, 7 días
  @ValidateNested({ each: true })
  @Type(() => ScheduleBlockDto)
  blocks: ScheduleBlockDto[];
}
