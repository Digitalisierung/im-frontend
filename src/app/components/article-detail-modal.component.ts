import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article } from '../models/article.model';
import { Catalog } from '../models/catalog.model';

@Component({
  selector: 'app-article-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade" [id]="modalId" tabindex="-1" [attr.aria-labelledby]="modalId + 'Label'" aria-hidden="true"
         data-testid="modal-product-details">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" [id]="modalId + 'Label'" data-testid="text-product-name">{{ article?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"
                    data-testid="button-close-modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="article">
              <!-- Product Image -->
              <div class="text-center mb-4" *ngIf="article.imageUrl">
                <img [src]="article.imageUrl" [alt]="article.name" class="img-fluid rounded" style="max-height: 300px;"
                     data-testid="img-product">
              </div>

              <!-- Basic Information -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">SKU</h6>
                  <p class="mb-0" data-testid="text-sku">{{ article.sku }}</p>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">Katalog</h6>
                  <p class="mb-0">
                    <span *ngIf="catalogName" class="badge" [ngClass]="'bg-' + catalogColor"
                          data-testid="badge-catalog">{{ catalogName }}</span>
                    <span *ngIf="!catalogName" class="badge bg-secondary" data-testid="badge-catalog-none">Nicht zugewiesen</span>
                  </p>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3" *ngIf="article.description">
                <h6 class="text-muted mb-2">Beschreibung</h6>
                <p class="mb-0" data-testid="text-description">{{ article.description }}</p>
              </div>

              <!-- Price and Stock -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">Preis</h6>
                  <p class="mb-0 fs-5 text-success"
                     data-testid="text-price">{{ ((article.price || 0) / 100) | number:'1.2-2' }} €</p>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted mb-2">Lagerbestand</h6>
                  <p class="mb-0" data-testid="text-stock">
                    <span [ngClass]="{
                      'text-danger': (article.stock || 0) < 10,
                      'text-warning': (article.stock || 0) >= 10 && (article.stock || 0) < 50,
                      'text-success': (article.stock || 0) >= 50
                    }">
                      {{ article.stock || 0 }} Stück
                    </span>
                  </p>
                </div>
              </div>

              <!-- Status Badges -->
              <div class="mb-3">
                <h6 class="text-muted mb-2">Status</h6>
                <span class="badge me-2" [ngClass]="article.active ? 'bg-success' : 'bg-secondary'"
                      data-testid="badge-active">
                  {{ article.active ? 'Aktiv' : 'Inaktiv' }}
                </span>
                <span class="badge" [ngClass]="article.featured ? 'bg-warning' : 'bg-light text-dark'"
                      data-testid="badge-featured">
                  {{ article.featured ? 'Hervorgehoben' : 'Normal' }}
                </span>
              </div>

              <!-- Dynamic Fields -->
              <div *ngIf="article.dynamicFields && article.dynamicFields.length > 0" class="mb-3">
                <h6 class="text-muted mb-2">Zusätzliche Eigenschaften</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered" data-testid="table-dynamic-fields">
                    <thead class="table-light">
                    <tr>
                      <th>Eigenschaft</th>
                      <th>Typ</th>
                      <th>Wert</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr *ngFor="let field of article.dynamicFields; let i = index"
                        [attr.data-testid]="'row-field-' + i">
                      <td [attr.data-testid]="'text-field-name-' + i">{{ field.name }}</td>
                      <td [attr.data-testid]="'text-field-type-' + i">{{ getFieldTypeLabel(field.type) }}</td>
                      <td [attr.data-testid]="'text-field-value-' + i">{{ formatFieldValue(field) }}</td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-testid="button-close">
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ArticleDetailModalComponent {
  @Input() article: Article | null = null;
  @Input() catalogName: string | null = null;
  @Input() catalogColor: string = 'secondary';
  @Input() modalId: string = 'articleDetailModal';

  getFieldTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      text: 'Text',
      number: 'Zahl',
      boolean: 'Ja/Nein',
      email: 'E-Mail',
      url: 'URL',
      color: 'Farbe',
      date: 'Datum'
    };
    return typeLabels[type] || type;
  }

  formatFieldValue(field: any): string {
    if (field.type === 'boolean') {
      return field.value === true || field.value === 'true' ? 'Ja' : 'Nein';
    }
    if (field.type === 'color') {
      return field.value;
    }
    return field.value?.toString() || '';
  }
}
