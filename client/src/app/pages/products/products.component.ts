import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CatalogService } from '../../services/catalog.service';
import { Product } from '../../models/product.model';
import { Catalog } from '../../models/catalog.model';
import { ProductDetailModalComponent } from '../../components/product-detail-modal.component';

declare var bootstrap: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductDetailModalComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  catalogs: Catalog[] = [];
  
  searchQuery = '';
  filterCatalog = '';
  filterStatus = '';
  
  isLoading = false;
  selectedProducts: Set<string> = new Set();
  bulkCatalogId = '';
  
  selectedProduct: Product | null = null;
  selectedProductCatalogName: string | null = null;
  selectedProductCatalogColor: string = 'secondary';

  constructor(
    private productService: ProductService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadProducts();
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    // Use backend filtering for search and catalog
    this.productService.getProducts(
      this.searchQuery || undefined, 
      this.filterCatalog || undefined
    ).subscribe({
      next: (products) => {
        // Apply client-side status filter if needed
        if (this.filterStatus) {
          this.products = products.filter(product =>
            (this.filterStatus === 'active' && product.active) ||
            (this.filterStatus === 'inactive' && !product.active)
          );
        } else {
          this.products = products;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterCatalog = '';
    this.filterStatus = '';
    this.loadProducts();
  }

  deleteProduct(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie dieses Produkt löschen möchten?')) {
      return;
    }

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
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

  // Bulk operations
  toggleProductSelection(productId: string | undefined): void {
    if (!productId) return;
    
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.products.forEach(p => p.id && this.selectedProducts.add(p.id));
    } else {
      this.selectedProducts.clear();
    }
  }

  isProductSelected(productId: string | undefined): boolean {
    return productId ? this.selectedProducts.has(productId) : false;
  }

  get allSelected(): boolean {
    return this.products.length > 0 && this.products.every(p => this.isProductSelected(p.id));
  }

  get hasSelection(): boolean {
    return this.selectedProducts.size > 0;
  }

  bulkAssignCatalog(): void {
    if (this.selectedProducts.size === 0) return;

    const productIds = Array.from(this.selectedProducts);
    const catalogId = this.bulkCatalogId || null;

    fetch('/api/products/bulk/catalog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds, catalogId })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message || 'Produkte erfolgreich aktualisiert');
        this.selectedProducts.clear();
        this.bulkCatalogId = '';
        this.loadProducts();
      })
      .catch(err => {
        console.error('Error updating products:', err);
        alert('Fehler beim Aktualisieren der Produkte');
      });
  }

  bulkDelete(): void {
    if (this.selectedProducts.size === 0) return;

    const count = this.selectedProducts.size;
    if (!confirm(`Sind Sie sicher, dass Sie ${count} Produkt(e) löschen möchten?`)) {
      return;
    }

    const productIds = Array.from(this.selectedProducts);

    fetch('/api/products/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds })
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Delete failed');
        }
        // Handle both JSON and 204 No Content responses
        if (response.status === 204) {
          return { message: 'Produkte erfolgreich gelöscht' };
        }
        return response.json();
      })
      .then(data => {
        alert(data.message || 'Produkte erfolgreich gelöscht');
        this.selectedProducts.clear();
        this.loadProducts();
      })
      .catch(err => {
        console.error('Error deleting products:', err);
        alert('Fehler beim Löschen der Produkte');
      });
  }

  onProductDoubleClick(product: Product): void {
    this.selectedProduct = product;
    this.selectedProductCatalogName = this.getCatalogName(product.catalogId);
    this.selectedProductCatalogColor = this.getCatalogColor(product.catalogId);
    
    const modalElement = document.getElementById('productDetailModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
