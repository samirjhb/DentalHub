import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { UpdateInventoryItemDto } from '../dto/update-inventory-item.dto';
import { InventoryItemMapper } from '../mappers/inventory-item.mapper';

@Injectable()
export class UpdateInventoryItemUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute(id: string, dto: UpdateInventoryItemDto) {
    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Insumo con ID ${id} no encontrado`);
    }
    return InventoryItemMapper.toResponse(updated);
  }
}
