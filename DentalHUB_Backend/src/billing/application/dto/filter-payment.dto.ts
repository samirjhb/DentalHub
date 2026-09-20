import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../shared/dto/pagination-query.dto';

export class FilterPaymentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'ID del paciente' })
  @IsOptional()
  @IsMongoId()
  patient?: string;

  @ApiPropertyOptional({ description: 'ID de la ficha clínica' })
  @IsOptional()
  @IsMongoId()
  clinicalRecord?: string;

  @ApiPropertyOptional({ description: 'Filtra pagos desde esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filtra pagos hasta esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
