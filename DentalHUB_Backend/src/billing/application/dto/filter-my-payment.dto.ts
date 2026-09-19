import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

// Igual que FilterPaymentDto pero sin `patient`/`clinicalRecord`: el paciente
// autenticado solo puede ver sus propios pagos.
export class FilterMyPaymentDto {
  @ApiPropertyOptional({ description: 'Filtra pagos desde esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filtra pagos hasta esta fecha (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
