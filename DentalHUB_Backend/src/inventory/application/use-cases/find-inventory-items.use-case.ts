import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
import { InventoryItemMapper } from '../mappers/inventory-item.mapper';
import { FindInventoryItemsQueryDto } from '../dto/find-inventory-items-query.dto';
import {
  buildPaginatedResult,
  isPaginationRequested,
  resolvePagination,
} from '../../../shared/pagination/pagination.util';

@Injectable()
export class FindInventoryItemsUseCase {
  constructor(private readonly repository: InventoryRepository) {}

  async execute(query?: FindInventoryItemsQueryDto) {
    if (isPaginationRequested(query)) {
      const { page, limit, skip } = resolvePagination(query);
      const [items, total] = await Promise.all([
        this.repository.findAll(skip, limit),
        this.repository.count(),
      ]);
      return buildPaginatedResult(
        items.map((item) => InventoryItemMapper.toResponse(item)),
        total,
        page,
        limit,
      );
    }

    const items = await this.repository.findAll();
    return items.map((item) => InventoryItemMapper.toResponse(item));
  }
}
