import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Nombre del insumo' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: 'Unidad de medida (ej. "ml", "unidades", "cajas")' })
  @IsString()
  @MinLength(1)
  unit: string;

  @ApiProperty({ description: 'Stock inicial' })
  @IsInt()
  @Min(0)
  currentStock: number;

  @ApiProperty({ description: 'Umbral de alerta de stock bajo' })
  @IsInt()
  @Min(0)
  minStock: number;
}
