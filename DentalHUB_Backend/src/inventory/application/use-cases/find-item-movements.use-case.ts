import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { StockMovementMapper } from '../mappers/stock-movement.mapper';

@Injectable()
export class FindItemMovementsUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute(itemId: string) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new NotFoundException(`Insumo con ID ${itemId} no encontrado`);
    }
    const movements = await this.repository.findMovementsByItem(itemId);
    return movements.map((movement) => StockMovementMapper.toResponse(movement));
  }
}
