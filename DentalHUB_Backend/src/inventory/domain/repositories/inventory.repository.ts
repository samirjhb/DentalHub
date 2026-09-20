import { InventoryItem } from '../entities/inventory-item.entity';
import { StockMovement } from '../entities/stock-movement.entity';
import { StockMovementType } from '../entities/stock-movement-type.enum';

export interface CreateInventoryItemData {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface UpdateInventoryItemData {
  name?: string;
  unit?: string;
  minStock?: number;
}

export interface CreateMovementData {
  item: string;
  type: StockMovementType;
  quantity: number;
  registeredBy: string;
  reason?: string;
}

export abstract class InventoryRepository {
  abstract create(data: CreateInventoryItemData): Promise<InventoryItem>;
  abstract update(
    id: string,
    data: UpdateInventoryItemData,
  ): Promise<InventoryItem | null>;
  abstract findAll(skip?: number, limit?: number): Promise<InventoryItem[]>;
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<InventoryItem | null>;
  abstract findLowStock(): Promise<InventoryItem[]>;

  // Aplica el delta de forma atómica ($inc de Mongo, no fetch-mutate-replace) —
  // dos movimientos concurrentes sobre el mismo insumo son plausibles en la
  // operación real de una clínica. Para SALIDA, la condición de "no dejar
  // stock negativo" viaja en la MISMA operación atómica (findOneAndUpdate con
  // filtro currentStock >= quantity), evitando la ventana de carrera de
  // "leer stock, decidir, escribir" en pasos separados. Devuelve null cuando
  // la condición no se cumple (stock insuficiente) — distinto de "no
  // encontrado", que el caso de uso ya descartó con un findById previo.
  abstract applyStockDelta(
    itemId: string,
    delta: number,
  ): Promise<InventoryItem | null>;

  abstract createMovement(data: CreateMovementData): Promise<StockMovement>;
  abstract findMovementsByItem(itemId: string): Promise<StockMovement[]>;
}
