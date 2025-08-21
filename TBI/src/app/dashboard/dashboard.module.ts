import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MatTabsModule } from '@angular/material/tabs';
import { RippleGridComponent } from './ripple-grid/ripple-grid.component';



@NgModule({
  declarations: [DashboardComponent, RippleGridComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatTabsModule,
  ]
})
export class DashboardModule { }
