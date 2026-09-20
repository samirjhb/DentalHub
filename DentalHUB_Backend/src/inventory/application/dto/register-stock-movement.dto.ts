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

  @ApiPropertyOptional({
    description:
      'Ignorado si se envía: el backend siempre usa el id del usuario ' +
      'autenticado (derivado del JWT) para evitar que se falsee este campo de auditoría.',
  })
  @IsOptional()
  @IsMongoId()
  registeredBy?: string;

  @ApiPropertyOptional({ description: 'Motivo del movimiento' })
  @IsOptional()
  @IsString()
  reason?: string;
}
