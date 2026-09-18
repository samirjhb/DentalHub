import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryRepository,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  CreateMovementData,
} from '../../../domain/repositories/inventory.repository';
import { InventoryItem as InventoryItemEntity } from '../../../domain/entities/inventory-item.entity';
import { StockMovement as StockMovementEntity } from '../../../domain/entities/stock-movement.entity';
import { InventoryItem, InventoryItemDocument } from './inventory-item.schema';
import { StockMovement, StockMovementDocument } from './stock-movement.schema';
import { InventoryItemMapper } from '../../../application/mappers/inventory-item.mapper';
import { StockMovementMapper } from '../../../application/mappers/stock-movement.mapper';

@Injectable()
export class InventoryMongoRepository extends InventoryRepository {
  constructor(
    @InjectModel(InventoryItem.name)
    private readonly inventoryItemModel: Model<InventoryItemDocument>,
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovementDocument>,
  ) {
    super();
  }

  async create(data: CreateInventoryItemData): Promise<InventoryItemEntity> {
    const created = await this.inventoryItemModel.create(data);
    return InventoryItemMapper.toDomain(created);
  }

  async update(
    id: string,
    data: UpdateInventoryItemData,
  ): Promise<InventoryItemEntity | null> {
    const doc = await this.inventoryItemModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return doc ? InventoryItemMapper.toDomain(doc) : null;
  }

  async findAll(): Promise<InventoryItemEntity[]> {
    const docs = await this.inventoryItemModel.find().sort({ name: 1 });
    return docs.map((doc) => InventoryItemMapper.toDomain(doc));
  }

  async findById(id: string): Promise<InventoryItemEntity | null> {
    const doc = await this.inventoryItemModel.findById(id);
    return doc ? InventoryItemMapper.toDomain(doc) : null;
  }

  async findLowStock(): Promise<InventoryItemEntity[]> {
    const docs = await this.inventoryItemModel
      .find({ $expr: { $lte: ['$currentStock', '$minStock'] } })
      .sort({ name: 1 });
    return docs.map((doc) => InventoryItemMapper.toDomain(doc));
  }

  async applyStockDelta(
    itemId: string,
    delta: number,
  ): Promise<InventoryItemEntity | null> {
    const filter: Record<string, unknown> = { _id: itemId };
    // La condición de no-negativo viaja en el MISMO filtro atómico — evita la
    // ventana de carrera de leer-decidir-escribir en pasos separados.
    if (delta < 0) {
      filter.currentStock = { $gte: -delta };
    }
    const doc = await this.inventoryItemModel.findOneAndUpdate(
      filter,
      { $inc: { currentStock: delta } },
      { new: true },
    );
    return doc ? InventoryItemMapper.toDomain(doc) : null;
  }

  async createMovement(data: CreateMovementData): Promise<StockMovementEntity> {
    const created = await this.stockMovementModel.create({
      ...data,
      movementDate: new Date(),
    });
    return StockMovementMapper.toDomain(created);
  }

  async findMovementsByItem(itemId: string): Promise<StockMovementEntity[]> {
    const docs = await this.stockMovementModel
      .find({ item: itemId })
      .sort({ movementDate: -1 })
      .populate('registeredBy', 'name email');
    return docs.map((doc) => StockMovementMapper.toDomain(doc));
  }
}
