import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class FilterPrescriptionDto {
  @ApiPropertyOptional({ description: 'ID del paciente' })
  @IsOptional()
  @IsMongoId()
  patient?: string;

  @ApiPropertyOptional({ description: 'ID del odontólogo' })
  @IsOptional()
  @IsMongoId()
  dentist?: string;

  @ApiPropertyOptional({ description: 'ID de la ficha clínica' })
  @IsOptional()
  @IsMongoId()
  clinicalRecord?: string;
}
