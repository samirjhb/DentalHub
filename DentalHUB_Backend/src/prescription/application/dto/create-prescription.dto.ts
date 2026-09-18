import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MedicationDto } from './medication.dto';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'ID del paciente' })
  @IsMongoId()
  patient: string;

  @ApiProperty({ description: 'ID del usuario (rol DENTIST) que emite la receta' })
  @IsMongoId()
  dentist: string;

  @ApiPropertyOptional({ description: 'ID de la ficha clínica asociada (opcional)' })
  @IsOptional()
  @IsMongoId()
  clinicalRecord?: string;

  @ApiProperty({ description: 'Medicamentos indicados', type: [MedicationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observations?: string;
}
