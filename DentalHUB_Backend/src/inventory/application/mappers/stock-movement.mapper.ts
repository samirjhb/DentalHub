import { StockMovement } from '../../domain/entities/stock-movement.entity';
import { StockMovementDocument } from '../../infrastructure/persistence/mongo/stock-movement.schema';

export class StockMovementMapper {
  static toDomain(doc: StockMovementDocument): StockMovement {
    return new StockMovement(
      doc._id,
      doc.item,
      doc.type as StockMovement['type'],
      doc.quantity,
      doc.registeredBy,
      doc.movementDate,
      doc.reason,
      (doc as unknown as { createdAt?: Date }).createdAt,
      (doc as unknown as { updatedAt?: Date }).updatedAt,
    );
  }

  static toResponse(entity: StockMovement) {
    return {
      _id: entity._id,
      item: entity.item,
      type: entity.type,
      quantity: entity.quantity,
      registeredBy: entity.registeredBy,
      movementDate: entity.movementDate,
      reason: entity.reason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
