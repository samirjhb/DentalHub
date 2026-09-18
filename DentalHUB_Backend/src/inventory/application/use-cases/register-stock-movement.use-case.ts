import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { RegisterStockMovementDto } from '../dto/register-stock-movement.dto';
import { StockMovementType } from '../../domain/entities/stock-movement-type.enum';
import { InventoryItemMapper } from '../mappers/inventory-item.mapper';
import { StockMovementMapper } from '../mappers/stock-movement.mapper';

@Injectable()
export class RegisterStockMovementUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute(itemId: string, dto: RegisterStockMovementDto) {
    const item = await this.repository.findById(itemId);
    if (!item) {
      throw new NotFoundException(`Insumo con ID ${itemId} no encontrado`);
    }

    const delta =
      dto.type === StockMovementType.ENTRADA ? dto.quantity : -dto.quantity;

    const updatedItem = await this.repository.applyStockDelta(itemId, delta);
    if (!updatedItem) {
      throw new BadRequestException(
        'Stock insuficiente para registrar la salida',
      );
    }

    const movement = await this.repository.createMovement({
      item: itemId,
      type: dto.type,
      quantity: dto.quantity,
      registeredBy: dto.registeredBy,
      reason: dto.reason,
    });

    return {
      movement: StockMovementMapper.toResponse(movement),
      item: InventoryItemMapper.toResponse(updatedItem),
    };
  }
}
