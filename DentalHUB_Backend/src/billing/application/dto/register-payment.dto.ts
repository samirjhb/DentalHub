import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../domain/entities/payment-method.enum';

export class RegisterPaymentDto {
  @ApiProperty({ description: 'ID de la ficha clínica' })
  @IsMongoId()
  clinicalRecord: string;

  @ApiProperty({ description: 'Índice del tratamiento dentro de la ficha' })
  @IsInt()
  @Min(0)
  treatmentIndex: number;

  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Ignorado si se envía: el backend siempre usa el id del usuario ' +
      'autenticado (derivado del JWT) para evitar que se falsee este campo de auditoría.',
  })
  @IsOptional()
  @IsMongoId()
  registeredBy?: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observations?: string;
}
