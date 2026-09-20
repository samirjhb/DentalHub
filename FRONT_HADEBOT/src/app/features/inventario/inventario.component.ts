import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { SessionManagerService } from 'src/app/core/auth/services/session-manager.service';
import { InventoryService, InventoryItem, UpdateInventoryItemDto } from './services/inventory.service';
import {
  ItemDialogComponent,
  ItemDialogResult,
} from './dialogs/item-dialog/item-dialog.component';
import {
  StockMovementDialogComponent,
  StockMovementDialogResult,
} from './dialogs/stock-movement-dialog/stock-movement-dialog.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    TablerIconsModule,
  ],
})
export class InventarioComponent implements OnInit {
  items: InventoryItem[] = [];
  isLoading = false;
  displayedColumns = ['name', 'unit', 'currentStock', 'minStock', 'status', 'actions'];

  // Gestionar insumos es administrativo (mismo molde que patient's
  // WRITE_ROLES), no clínico — el backend sigue siendo la autoridad real,
  // esto solo evita mostrar botones que terminarían en 403.
  get canWrite(): boolean {
    const role = this.sessionManager.getRole();
    return role === 'SUPER_ADMIN' || role === 'CLINIC_ADMIN' || role === 'RECEPTIONIST';
  }

  constructor(
    private inventoryService: InventoryService,
    private sessionManager: SessionManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.inventoryService
      .getItems()
      .then((items) => {
        this.items = items;
      })
      .catch(() => {
        this.snackBar.open('Error al cargar el inventario', 'Cerrar', { duration: 3000 });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  isLowStock(item: InventoryItem): boolean {
    return item.currentStock <= item.minStock;
  }

  openItemDialog(): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '400px',
      data: { mode: 'create', name: '', unit: '', currentStock: 0, minStock: 0 },
    });

    dialogRef.afterClosed().subscribe((result: ItemDialogResult | undefined) => {
      if (!result) return;
      this.inventoryService
        .createItem(result)
        .then(() => {
          this.snackBar.open('Insumo creado correctamente', 'Cerrar', { duration: 2000 });
          this.loadItems();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al crear el insumo';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }

  openEditDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      width: '400px',
      data: {
        mode: 'edit',
        name: item.name,
        unit: item.unit,
        currentStock: item.currentStock,
        minStock: item.minStock,
      },
    });

    dialogRef.afterClosed().subscribe((result: ItemDialogResult | undefined) => {
      if (!result) return;
      const dto: UpdateInventoryItemDto = {
        name: result.name,
        unit: result.unit,
        minStock: result.minStock,
      };
      this.inventoryService
        .updateItem(item._id, dto)
        .then(() => {
          this.snackBar.open('Insumo actualizado correctamente', 'Cerrar', { duration: 2000 });
          this.loadItems();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al actualizar el insumo';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }

  openMovementDialog(item: InventoryItem): void {
    const dialogRef = this.dialog.open(StockMovementDialogComponent, {
      width: '400px',
      data: {
        itemName: item.name,
        currentStock: item.currentStock,
        unit: item.unit,
        type: 'ENTRADA',
        quantity: 1,
        reason: '',
      },
    });

    dialogRef.afterClosed().subscribe((result: StockMovementDialogResult | undefined) => {
      if (!result) return;
      const registeredBy = this.sessionManager.getUserId();
      if (!registeredBy) {
        this.snackBar.open('No se pudo identificar al usuario logueado', 'Cerrar', {
          duration: 3000,
        });
        return;
      }

      this.inventoryService
        .registerMovement(item._id, { ...result, registeredBy })
        .then(() => {
          this.snackBar.open('Movimiento registrado correctamente', 'Cerrar', {
            duration: 2000,
          });
          this.loadItems();
        })
        .catch((error) => {
          const message = error?.error?.message ?? 'Error al registrar el movimiento';
          this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        });
    });
  }
}
