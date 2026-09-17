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

  @ApiProperty({
    description:
      'ID del usuario (staff) que registra el pago — ningún controller del ' +
      'proyecto lee req.user hoy, mismo patrón que "dentist" en CreateAppointmentDto',
  })
  @IsMongoId()
  registeredBy: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observations?: string;
}
