import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../domain/entities/appointment-status.enum';

// Igual que FilterAppointmentDto pero sin `patient` ni `dentist`: el paciente
// autenticado solo puede filtrar sus propias citas, nunca elegir de quién.
export class FilterMyAppointmentDto {
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
