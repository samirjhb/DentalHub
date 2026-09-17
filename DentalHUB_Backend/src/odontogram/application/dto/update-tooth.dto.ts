import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ToothStatus } from '../../domain/entities/tooth-state.entity';

export class UpdateToothDto {
  @ApiProperty({
    description: 'Estado clínico de la pieza dental',
    enum: ToothStatus,
    example: ToothStatus.CARIADO,
    required: true,
  })
  @IsEnum(ToothStatus)
  status: ToothStatus;

  @ApiProperty({
    description: 'Observaciones específicas de la pieza',
    example: 'Caries interproximal detectada en control de rutina',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;
}
