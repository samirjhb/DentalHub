import { Component, Input } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

// KPI genérico y reutilizable — sin datos propios, recibe todo por @Input.
// Reemplaza los widgets fijos (yearly-breakup/monthly-earnings) que mostraban
// series y montos hardcodeados sin ningún servicio detrás.
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule],
  template: `
    <mat-card class="cardWithShadow stat-card">
      <mat-card-content class="d-flex align-items-center gap-16">
        <div class="stat-card__icon" [style.background]="accentColor + '1a'" [style.color]="accentColor">
          <i-tabler [name]="icon" class="icon-24 d-flex"></i-tabler>
        </div>
        <div>
          <h3 class="f-s-24 f-w-600 m-0">{{ value }}</h3>
          <span class="text-muted f-s-14">{{ label }}</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .stat-card__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() icon = 'chart-bar';
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() accentColor = '#5d87ff';
}
