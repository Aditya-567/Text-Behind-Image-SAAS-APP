import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: 'login',
      loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
    },
    {
      path: 'home',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    },
    {
      path: '',
      redirectTo: '/home',
      pathMatch: 'full'
    }
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
