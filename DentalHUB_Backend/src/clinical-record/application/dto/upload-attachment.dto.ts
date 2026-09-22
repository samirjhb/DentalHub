import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UploadAttachmentDto {
  // Llega como campo de un multipart/form-data (junto al archivo), por eso
  // necesita @Type(() => Number) igual que PaginationQueryDto con sus query
  // params — sin `transform: true` en el ValidationPipe global, sigue
  // llegando como string si no se fuerza la conversión acá.
  @ApiPropertyOptional({
    description:
      'Índice del tratamiento al que pertenece el adjunto (omitir para un adjunto general de la ficha)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  treatmentIndex?: number;
}
