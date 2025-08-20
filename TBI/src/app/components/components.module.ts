import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TbiComponent } from './tbi/tbi.component';
import { FormsModule } from '@angular/forms';
import { ComponentsRoutingModule } from './components-routing.module';

@NgModule({
  declarations: [TbiComponent],
  imports: [CommonModule,
    FormsModule,
    ComponentsRoutingModule,
    MatTabsModule],
  exports: [TbiComponent],
})
export class ComponentsModule {}
