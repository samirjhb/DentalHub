import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedResponse } from 'src/app/core/models/pagination.model';

export type StockMovementType = 'ENTRADA' | 'SALIDA';

export interface InventoryItem {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemDto {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface UpdateInventoryItemDto {
  name?: string;
  unit?: string;
  minStock?: number;
}

export interface RegisterStockMovementDto {
  type: StockMovementType;
  quantity: number;
  registeredBy: string;
  reason?: string;
}

export interface StockMovement {
  _id: string;
  item: string;
  type: StockMovementType;
  quantity: number;
  // El backend popula registeredBy con proyección name/email (nunca el
  // password) al listar el historial.
  registeredBy: string | { _id: string; name: string; email: string };
  movementDate: string;
  reason?: string;
}

// El AuthInterceptor global ya adjunta el Bearer token real a toda petición
// HttpClient. Feature-scoped (único consumidor confirmado: Inventario).
@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private http: HttpClient) {}

  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    return await firstValueFrom(
      this.http.post<InventoryItem>(`${environment.apiUrl}/inventory/items`, dto),
    );
  }

  async getItems(): Promise<InventoryItem[]> {
    return await firstValueFrom(
      this.http.get<InventoryItem[]>(`${environment.apiUrl}/inventory/items`),
    );
  }

  async getItemsPage(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<InventoryItem>> {
    return await firstValueFrom(
      this.http.get<PaginatedResponse<InventoryItem>>(
        `${environment.apiUrl}/inventory/items`,
        { params: { page, limit } },
      ),
    );
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await firstValueFrom(
      this.http.get<InventoryItem[]>(`${environment.apiUrl}/inventory/low-stock`),
    );
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItem> {
    return await firstValueFrom(
      this.http.patch<InventoryItem>(`${environment.apiUrl}/inventory/items/${id}`, dto),
    );
  }

  async registerMovement(
    itemId: string,
    dto: RegisterStockMovementDto,
  ): Promise<{ movement: StockMovement; item: InventoryItem }> {
    return await firstValueFrom(
      this.http.post<{ movement: StockMovement; item: InventoryItem }>(
        `${environment.apiUrl}/inventory/items/${itemId}/movements`,
        dto,
      ),
    );
  }

  async getMovements(itemId: string): Promise<StockMovement[]> {
    return await firstValueFrom(
      this.http.get<StockMovement[]>(
        `${environment.apiUrl}/inventory/items/${itemId}/movements`,
      ),
    );
  }
}
