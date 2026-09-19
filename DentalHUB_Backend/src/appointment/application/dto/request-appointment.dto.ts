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

// Igual que CreateAppointmentDto pero sin `patient`: el paciente autenticado
// nunca elige de quién es la cita, se inyecta desde el JWT en el controller.
export class RequestAppointmentDto {
  @ApiProperty({ description: 'ID del odontólogo con quien se solicita la cita' })
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
}
