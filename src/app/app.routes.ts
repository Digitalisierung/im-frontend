import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ArticlesComponent } from '@/app/pages/articles/articles.component';
import { NewArticleComponent } from '@/app/pages/new-article/new-article.component';
import { CatalogsComponent } from './pages/catalogs/catalogs.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventar', component: ArticlesComponent },
  { path: 'inventar/new', component: NewArticleComponent },
  { path: 'inventar/edit/:id', component: NewArticleComponent },
  { path: 'catalogs', component: CatalogsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
