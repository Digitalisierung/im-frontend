import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { CatalogService } from '../../services/catalog.service';
import { Product } from '../../models/product.model';
import { Catalog } from '../../models/catalog.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  catalogs: Catalog[] = [];
  recentProducts: Product[] = [];
  
  totalProducts = 0;
  activeCatalogs = 0;
  newThisWeek = 0;
  unassigned = 0;

  constructor(
    private productService: ArticleService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.totalProducts = products.length;
        this.recentProducts = products.slice(0, 3);
        this.unassigned = products.filter(p => !p.catalogId).length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        this.newThisWeek = products.filter(p => 
          p.createdAt && new Date(p.createdAt) > oneWeekAgo
        ).length;
      },
      error: (err) => console.error('Error loading products:', err)
    });

    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
        this.activeCatalogs = catalogs.length;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  deleteProduct(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error('Error deleting product:', err)
    });
  }

  getCatalogName(catalogId: string | undefined): string {
    if (!catalogId) return 'Nicht zugewiesen';
    const catalog = this.catalogs.find(c => c.id === catalogId);
    return catalog?.name || 'Unbekannt';
  }

  getCatalogColor(catalogId: string | undefined): string {
    if (!catalogId) return 'secondary';
    const catalog = this.catalogs.find(c => c.id === catalogId);
    return catalog?.color || 'secondary';
  }
}
