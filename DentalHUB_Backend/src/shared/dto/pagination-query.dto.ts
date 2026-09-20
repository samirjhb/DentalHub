import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Ambos campos opcionales a propósito: la paginación es opt-in. Si ninguno
// viene en el request, el endpoint devuelve el listado completo tal como
// hoy (compatibilidad retro para los selectores de paciente/dentista y
// contadores que necesitan el array entero, no una página).
export class PaginationQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    example: 1,
    description:
      'Página (1-based). Si se omite junto con limit, el endpoint retorna el listado completo sin paginar.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    example: 20,
    description:
      'Tamaño de página, máximo 100. Si se omite junto con page, el endpoint retorna el listado completo sin paginar.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
