import { InventoryItem } from '../../domain/entities/inventory-item.entity';
import { InventoryItemDocument } from '../../infrastructure/persistence/mongo/inventory-item.schema';

export class InventoryItemMapper {
  static toDomain(doc: InventoryItemDocument): InventoryItem {
    return new InventoryItem(
      doc._id,
      doc.name,
      doc.unit,
      doc.currentStock,
      doc.minStock,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  static toResponse(entity: InventoryItem) {
    return {
      _id: entity._id,
      name: entity.name,
      unit: entity.unit,
      currentStock: entity.currentStock,
      minStock: entity.minStock,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
