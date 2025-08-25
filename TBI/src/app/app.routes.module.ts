import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './login/gaurd/no-auth.guard';
import { AboutUsComponent } from './shared/about-us/about-us.component';
import { AuthGuard } from './login/gaurd/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'text-behind-image',
    loadChildren: () =>
      import('./components/components.module').then((m) => m.ComponentsModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
