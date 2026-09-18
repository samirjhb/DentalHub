import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StockMovementType } from '../../services/inventory.service';

export interface StockMovementDialogData {
  itemName: string;
  currentStock: number;
  unit: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

export interface StockMovementDialogResult {
  type: StockMovementType;
  quantity: number;
  reason?: string;
}

const TYPE_OPTIONS: { value: StockMovementType; label: string }[] = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
];

@Component({
  selector: 'app-stock-movement-dialog',
  templateUrl: './stock-movement-dialog.component.html',
  styleUrls: ['./stock-movement-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class StockMovementDialogComponent {
  typeOptions = TYPE_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<StockMovementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockMovementDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.quantity > 0 && this.data.type) {
      const result: StockMovementDialogResult = {
        type: this.data.type,
        quantity: this.data.quantity,
        reason: this.data.reason || undefined,
      };
      this.dialogRef.close(result);
    }
  }
}
