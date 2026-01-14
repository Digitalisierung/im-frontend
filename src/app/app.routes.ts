import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { NewProductComponent } from './pages/new-product/new-product.component';
import { CatalogsComponent } from './pages/catalogs/catalogs.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/new', component: NewProductComponent },
  { path: 'products/edit/:id', component: NewProductComponent },
  { path: 'catalogs', component: CatalogsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
