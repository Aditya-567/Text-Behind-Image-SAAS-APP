import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TbiComponent } from './tbi/tbi.component';

const routes: Routes = [
  {
    path: '', 
    component: TbiComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComponentsRoutingModule {}
