import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';
import { InventoryItemMapper } from '../mappers/inventory-item.mapper';

@Injectable()
export class CreateInventoryItemUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute(dto: CreateInventoryItemDto) {
    const created = await this.repository.create(dto);
    return InventoryItemMapper.toResponse(created);
  }
}
