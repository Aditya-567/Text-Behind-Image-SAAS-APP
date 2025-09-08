import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TbiComponent } from './tbi/tbi.component';
import { ImageStorageComponent } from './image-storage/image-storage.component';

const routes: Routes = [
  {
    path: '', 
    component: TbiComponent,
  },
  {
    path: 'image-storage',
    component: ImageStorageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentsRoutingModule {}
