import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../domain/entities/appointment-status.enum';

export class FilterAppointmentDto {
  @ApiPropertyOptional({ description: 'ID del odontólogo' })
  @IsOptional()
  @IsMongoId()
  dentist?: string;

  @ApiPropertyOptional({ description: 'ID del paciente' })
  @IsOptional()
  @IsMongoId()
  patient?: string;

  @ApiPropertyOptional({ enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Filtra citas desde esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filtra citas hasta esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
