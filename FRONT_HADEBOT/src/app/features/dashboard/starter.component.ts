import { Component, ViewEncapsulation } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { AppSalesOverviewComponent } from 'src/app/features/dashboard/sales-overview/sales-overview.component';
import { AppYearlyBreakupComponent } from 'src/app/features/dashboard/yearly-breakup/yearly-breakup.component';
import { AppMonthlyEarningsComponent } from 'src/app/features/dashboard/monthly-earnings/monthly-earnings.component';

@Component({
  selector: 'app-starter',
  imports: [
    MaterialModule,
    AppSalesOverviewComponent,
    AppYearlyBreakupComponent,
    AppMonthlyEarningsComponent,
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent { }