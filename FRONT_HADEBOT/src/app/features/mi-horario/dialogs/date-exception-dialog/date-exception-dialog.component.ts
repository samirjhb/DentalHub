import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CreateDateExceptionDto } from 'src/app/core/services/availability.service';

export type DateExceptionDialogResult = CreateDateExceptionDto;

@Component({
  selector: 'app-date-exception-dialog',
  standalone: true,
  templateUrl: './date-exception-dialog.component.html',
  imports: [CommonModule, MatDialogModule, FormsModule, MaterialModule, TablerIconsModule],
})
export class DateExceptionDialogComponent {
  data: CreateDateExceptionDto = {
    date: new Date().toISOString().slice(0, 10),
    allDay: true,
    startTime: '',
    endTime: '',
    reason: '',
  };

  constructor(public dialogRef: MatDialogRef<DateExceptionDialogComponent>) {}

  get isValid(): boolean {
    if (!this.data.date) return false;
    if (this.data.allDay) return true;
    return !!this.data.startTime && !!this.data.endTime;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (!this.isValid) return;
    const result: DateExceptionDialogResult = this.data.allDay
      ? { date: this.data.date, allDay: true, reason: this.data.reason }
      : { ...this.data };
    this.dialogRef.close(result);
  }
}
