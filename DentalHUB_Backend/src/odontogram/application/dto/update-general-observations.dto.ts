import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateGeneralObservationsDto {
  @ApiProperty({
    description: 'Observaciones generales del odontograma',
    example: 'Paciente con buena higiene oral, control cada 6 meses',
    required: true,
  })
  @IsString()
  observations: string;
}
