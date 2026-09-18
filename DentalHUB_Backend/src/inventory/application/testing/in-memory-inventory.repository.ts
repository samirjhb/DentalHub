import {
  InventoryRepository,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  CreateMovementData,
} from '../../domain/repositories/inventory.repository';
import { InventoryItem } from '../../domain/entities/inventory-item.entity';
import { StockMovement } from '../../domain/entities/stock-movement.entity';

export class InMemoryInventoryRepository extends InventoryRepository {
  private items: InventoryItem[] = [];
  private movements: StockMovement[] = [];
  private nextItemId = 1;
  private nextMovementId = 1;

  async create(data: CreateInventoryItemData): Promise<InventoryItem> {
    const item = new InventoryItem(
      String(this.nextItemId++),
      data.name,
      data.unit,
      data.currentStock,
      data.minStock,
      new Date(),
      new Date(),
    );
    this.items.push(item);
    return item;
  }

  async update(
    id: string,
    data: UpdateInventoryItemData,
  ): Promise<InventoryItem | null> {
    const item = await this.findById(id);
    if (!item) return null;
    if (data.name !== undefined) item.name = data.name;
    if (data.unit !== undefined) item.unit = data.unit;
    if (data.minStock !== undefined) item.minStock = data.minStock;
    return item;
  }

  async findAll(): Promise<InventoryItem[]> {
    return this.items;
  }

  async findById(id: string): Promise<InventoryItem | null> {
    return this.items.find((i) => String(i._id) === id) ?? null;
  }

  async findLowStock(): Promise<InventoryItem[]> {
    return this.items.filter((i) => i.currentStock <= i.minStock);
  }

  // Simula la condición atómica findOneAndUpdate({currentStock: {$gte: -delta}})
  // del repositorio Mongo real: si el delta es negativo y dejaría el stock por
  // debajo de cero, no aplica el cambio (devuelve null).
  async applyStockDelta(
    itemId: string,
    delta: number,
  ): Promise<InventoryItem | null> {
    const item = await this.findById(itemId);
    if (!item) return null;
    if (item.currentStock + delta < 0) return null;
    item.currentStock += delta;
    return item;
  }

  async createMovement(data: CreateMovementData): Promise<StockMovement> {
    const movement = new StockMovement(
      String(this.nextMovementId++),
      data.item,
      data.type,
      data.quantity,
      data.registeredBy,
      new Date(),
      data.reason,
      new Date(),
      new Date(),
    );
    this.movements.push(movement);
    return movement;
  }

  async findMovementsByItem(itemId: string): Promise<StockMovement[]> {
    return this.movements.filter((m) => m.item === itemId);
  }
}
