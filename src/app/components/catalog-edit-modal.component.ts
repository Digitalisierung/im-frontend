import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Catalog, InsertCatalog } from '../models/catalog.model';

@Component({
  selector: 'app-catalog-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [id]="modalId" tabindex="-1" [attr.aria-labelledby]="modalId + 'Label'" aria-hidden="true" data-testid="modal-catalog-edit">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" [id]="modalId + 'Label'">{{ catalog ? 'Katalog bearbeiten' : 'Neuer Katalog' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen" data-testid="button-close-modal"></button>
          </div>
          <div class="modal-body">
            <form #catalogForm="ngForm">
              <!-- Name -->
              <div class="mb-3">
                <label for="catalogName" class="form-label">Name *</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="catalogName"
                  [(ngModel)]="formData.name" 
                  name="name"
                  required
                  minlength="2"
                  #nameField="ngModel"
                  data-testid="input-catalog-name">
                <div *ngIf="nameField.invalid && nameField.touched" class="text-danger small mt-1">
                  <div *ngIf="nameField.errors?.['required']">Name ist erforderlich</div>
                  <div *ngIf="nameField.errors?.['minlength']">Name muss mindestens 2 Zeichen lang sein</div>
                </div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label for="catalogDescription" class="form-label">Beschreibung</label>
                <textarea 
                  class="form-control" 
                  id="catalogDescription"
                  [(ngModel)]="formData.description" 
                  name="description"
                  rows="3"
                  data-testid="input-catalog-description"></textarea>
              </div>

              <!-- Color -->
              <div class="mb-3">
                <label for="catalogColor" class="form-label">Farbe</label>
                <select 
                  class="form-select" 
                  id="catalogColor"
                  [(ngModel)]="formData.color" 
                  name="color"
                  data-testid="select-catalog-color">
                  <option value="primary">Blau (Primary)</option>
                  <option value="secondary">Grau (Secondary)</option>
                  <option value="success">Grün (Success)</option>
                  <option value="danger">Rot (Danger)</option>
                  <option value="warning">Gelb (Warning)</option>
                  <option value="info">Hellblau (Info)</option>
                  <option value="dark">Schwarz (Dark)</option>
                </select>
                <div class="mt-2">
                  <span class="badge" [ngClass]="'bg-' + formData.color">Vorschau</span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-testid="button-cancel">Abbrechen</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="catalogForm.invalid"
              (click)="onSave()"
              data-testid="button-save">
              {{ catalog ? 'Aktualisieren' : 'Erstellen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CatalogEditModalComponent implements OnChanges {
  @Input() catalog: Catalog | null = null;
  @Input() modalId: string = 'catalogEditModal';
  @Output() save = new EventEmitter<InsertCatalog>();

  formData: InsertCatalog = {
    name: '',
    description: '',
    color: 'primary',
    createdAt: new Date().toISOString()
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['catalog'] && this.catalog) {
      this.formData = {
        name: this.catalog.name,
        description: this.catalog.description || '',
        color: this.catalog.color || 'primary',
        createdAt: this.initializeCreatedAt()
      };
    } else if (changes['catalog'] && !this.catalog) {
      this.resetForm();
    }
  }

  onSave(): void {
    this.save.emit(this.formData);
  }

  resetForm(): void {
    this.formData = {
      name: '',
      description: '',
      color: 'primary',
      createdAt: new Date().toISOString()
    };
  }

  private initializeCreatedAt(): string {
    return this.catalog?.createdAt || new Date().toISOString();
  }
}
