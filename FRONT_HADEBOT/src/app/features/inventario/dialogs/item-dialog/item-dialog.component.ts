import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ItemDialogData {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

export interface ItemDialogResult {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
}

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.component.html',
  styleUrls: ['./item-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class ItemDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ItemDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.data.name && this.data.unit && this.data.currentStock >= 0 && this.data.minStock >= 0) {
      const result: ItemDialogResult = {
        name: this.data.name,
        unit: this.data.unit,
        currentStock: this.data.currentStock,
        minStock: this.data.minStock,
      };
      this.dialogRef.close(result);
    }
  }
}
