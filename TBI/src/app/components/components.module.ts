import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TbiComponent } from './tbi/tbi.component';
import { FormsModule } from '@angular/forms';
import { ComponentsRoutingModule } from './components-routing.module';
import { ImageStorageComponent } from './image-storage/image-storage.component';

@NgModule({
  declarations: [TbiComponent,ImageStorageComponent],
  imports: [CommonModule,
    FormsModule,
    ComponentsRoutingModule,
    MatTabsModule],
  exports: [TbiComponent, ImageStorageComponent],
})
export class ComponentsModule {}
