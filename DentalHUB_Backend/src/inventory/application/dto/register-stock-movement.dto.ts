import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsMongoId, IsOptional, IsPositive, IsString } from 'class-validator';
import { StockMovementType } from '../../domain/entities/stock-movement-type.enum';

export class RegisterStockMovementDto {
  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ description: 'Cantidad del movimiento' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'ID del usuario que registra el movimiento' })
  @IsMongoId()
  registeredBy: string;

  @ApiPropertyOptional({ description: 'Motivo del movimiento' })
  @IsOptional()
  @IsString()
  reason?: string;
}
