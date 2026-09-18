import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ description: 'Nombre del insumo' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ description: 'Unidad de medida' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  unit?: string;

  @ApiPropertyOptional({ description: 'Umbral de alerta de stock bajo' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}
