import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CreateOdontogramDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '6579f236c25e43b9b9e0c123',
    required: true,
  })
  @IsMongoId()
  patient: string;
}
