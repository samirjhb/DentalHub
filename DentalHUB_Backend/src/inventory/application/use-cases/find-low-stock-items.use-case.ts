import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InventoryItemMapper } from '../mappers/inventory-item.mapper';

@Injectable()
export class FindLowStockItemsUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute() {
    const items = await this.repository.findLowStock();
    return items.map((item) => InventoryItemMapper.toResponse(item));
  }
}
