import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { Catalog, InsertCatalog } from '../../models/catalog.model';
import { CatalogEditModalComponent } from '../../components/catalog-edit-modal.component';

declare var bootstrap: any;

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule, CatalogEditModalComponent],
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.css']
})
export class CatalogsComponent implements OnInit {
  catalogs: Catalog[] = [];
  
  newCatalog: InsertCatalog = {
    name: '',
    description: '',
    color: 'primary'
  };
  
  selectedCatalog: Catalog | null = null;

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  createCatalog(): void {
    if (!this.newCatalog.name.trim()) {
      alert('Bitte geben Sie einen Katalognamen ein.');
      return;
    }

    this.catalogService.createCatalog(this.newCatalog).subscribe({
      next: () => {
        this.loadCatalogs();
        this.resetNewCatalogForm();
        const modal = document.getElementById('newCatalogModal');
        if (modal) {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          bootstrapModal?.hide();
        }
      },
      error: (err) => {
        console.error('Error creating catalog:', err);
        alert('Fehler beim Erstellen des Katalogs. Bitte versuchen Sie es erneut.');
      }
    });
  }

  deleteCatalog(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie diesen Katalog löschen möchten?')) {
      return;
    }

    this.catalogService.deleteCatalog(id).subscribe({
      next: () => {
        this.loadCatalogs();
      },
      error: (err) => {
        console.error('Error deleting catalog:', err);
        alert('Fehler beim Löschen des Katalogs. Bitte versuchen Sie es erneut.');
      }
    });
  }

  resetNewCatalogForm(): void {
    this.newCatalog = {
      name: '',
      description: '',
      color: 'primary'
    };
  }

  get totalCatalogs(): number {
    return this.catalogs.length;
  }

  get totalProducts(): number {
    return this.catalogs.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
  }

  get avgProductsPerCatalog(): number {
    if (this.catalogs.length === 0) return 0;
    return Math.round(this.totalProducts / this.catalogs.length);
  }

  get emptyCatalogs(): number {
    return this.catalogs.filter(cat => !cat.productCount || cat.productCount === 0).length;
  }

  onCatalogDoubleClick(catalog: Catalog): void {
    this.selectedCatalog = catalog;
    
    const modalElement = document.getElementById('catalogEditModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onCatalogUpdate(catalogData: InsertCatalog): void {
    if (!this.selectedCatalog?.id) return;

    this.catalogService.updateCatalog(this.selectedCatalog.id, catalogData).subscribe({
      next: () => {
        this.loadCatalogs();
        const modalElement = document.getElementById('catalogEditModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
        this.selectedCatalog = null;
      },
      error: (err) => {
        console.error('Error updating catalog:', err);
        alert('Fehler beim Aktualisieren des Katalogs. Bitte versuchen Sie es erneut.');
      }
    });
  }
}
