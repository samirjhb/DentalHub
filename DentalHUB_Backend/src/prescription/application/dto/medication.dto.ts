import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class MedicationDto {
  @ApiProperty({ description: 'Nombre del medicamento' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Dosis (ej. "500mg")' })
  @IsString()
  @MinLength(1)
  dosage: string;

  @ApiProperty({ description: 'Frecuencia (ej. "cada 8 horas")' })
  @IsString()
  @MinLength(1)
  frequency: string;

  @ApiProperty({ description: 'Duración (ej. "7 días")' })
  @IsString()
  @MinLength(1)
  duration: string;

  @ApiPropertyOptional({ description: 'Instrucciones adicionales' })
  @IsOptional()
  @IsString()
  instructions?: string;
}
