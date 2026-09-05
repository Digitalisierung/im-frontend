import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CatalogService } from '../../services/catalog.service';
import { Product, InsertProduct, DynamicField } from '../../models/product.model';
import { Catalog } from '../../models/catalog.model';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.css']
})
export class NewProductComponent implements OnInit {
  productForm: FormGroup;
  catalogs: Catalog[] = [];
  isEditMode = false;
  productId?: string;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;

  constructor(
    private fb: FormBuilder,
    private productService: ArticleService,
    private catalogService: CatalogService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]+$/)]],
      description: ['', Validators.maxLength(500)],
      price: [null, [Validators.min(0)]],
      stock: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]],
      catalogId: [''],
      active: [true],
      featured: [false],
      dynamicFields: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProduct(params['id']);
      }
    });
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  loadProduct(id: string): void {
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          stock: product.stock,
          catalogId: product.catalogId,
          active: product.active,
          featured: product.featured
        });
        
        // Set image preview if product has an image
        if (product.imageUrl) {
          this.imagePreview = product.imageUrl;
        }

        if (product.dynamicFields && product.dynamicFields.length > 0) {
          product.dynamicFields.forEach(field => {
            this.addDynamicField(field);
          });
        }
      },
      error: (err) => console.error('Error loading product:', err)
    });
  }

  get dynamicFields(): FormArray {
    return this.productForm.get('dynamicFields') as FormArray;
  }

  createDynamicFieldGroup(field?: DynamicField): FormGroup {
    // Convert boolean values to strings for the select field
    let fieldValue = field?.value || '';
    if (field?.type === 'boolean' && typeof field.value === 'boolean') {
      fieldValue = field.value.toString();
    }
    
    const group = this.fb.group({
      name: [field?.name || '', [Validators.required, Validators.minLength(2)]],
      type: [field?.type || 'text', Validators.required],
      value: [fieldValue, Validators.required]
    });
    
    // Add dynamic validation based on type
    if (field?.type) {
      this.updateDynamicFieldValidation(group, field.type);
    }
    
    // Listen for type changes to update validation
    group.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.updateDynamicFieldValidation(group, type);
      }
    });
    
    return group;
  }
  
  updateDynamicFieldValidation(group: FormGroup, type: string): void {
    const valueControl = group.get('value');
    if (!valueControl) return;
    
    // Clear existing validators
    valueControl.clearValidators();
    
    // Add type-specific validators
    const validators: any[] = [Validators.required];
    
    switch (type) {
      case 'email':
        validators.push(Validators.email);
        break;
      case 'number':
        // Accept both integers and decimal numbers (e.g., 12, 12.5, 0.99)
        validators.push(Validators.pattern(/^-?\d+(\.\d+)?$/));
        break;
      case 'url':
        validators.push(Validators.pattern(/^https?:\/\/.+/));
        break;
      case 'color':
        validators.push(Validators.pattern(/^#[0-9A-Fa-f]{6}$/));
        break;
      case 'boolean':
        // No special validation for boolean, handled by select input
        break;
    }
    
    valueControl.setValidators(validators);
    valueControl.updateValueAndValidity();
  }

  addDynamicField(field?: DynamicField): void {
    this.dynamicFields.push(this.createDynamicFieldGroup(field));
  }

  removeDynamicField(index: number): void {
    this.dynamicFields.removeAt(index);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.productForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;
    
    if (field.errors['required']) return 'Dieses Feld ist erforderlich';
    if (field.errors['minlength']) return `Mindestens ${field.errors['minlength'].requiredLength} Zeichen erforderlich`;
    if (field.errors['maxlength']) return `Maximal ${field.errors['maxlength'].requiredLength} Zeichen erlaubt`;
    if (field.errors['pattern']) {
      if (fieldName === 'sku') return 'SKU muss Großbuchstaben, Zahlen und Bindestriche enthalten';
      if (fieldName === 'stock') return 'Bestand muss eine ganze Zahl sein';
      return 'Ungültiges Format';
    }
    if (field.errors['min']) return `Mindestwert: ${field.errors['min'].min}`;
    if (field.errors['email']) return 'Ungültige E-Mail-Adresse';
    
    return 'Ungültiger Wert';
  }
  
  getDynamicFieldError(index: number, controlName: string): string | null {
    const control = this.dynamicFields.at(index)?.get(controlName);
    if (!control || !control.touched || !control.errors) return null;
    
    if (control.errors['required']) return 'Erforderlich';
    if (control.errors['minlength']) return `Min. ${control.errors['minlength'].requiredLength} Zeichen`;
    if (control.errors['email']) return 'Ungültige E-Mail';
    if (control.errors['pattern']) {
      const type = this.dynamicFields.at(index)?.get('type')?.value;
      if (type === 'number') return 'Muss eine Zahl sein (z.B. 12 oder 12.5)';
      if (type === 'url') return 'Muss mit http:// oder https:// beginnen';
      if (type === 'color') return 'Format: #RRGGBB';
      return 'Ungültiges Format';
    }
    
    return 'Ungültig';
  }
  
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        alert('Nur Bilddateien (JPEG, PNG, GIF, WebP) sind erlaubt!');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Die Datei ist zu groß! Maximale Größe: 5MB');
        return;
      }
      
      this.selectedImage = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedImage) return null;

    const formData = new FormData();
    formData.append('image', this.selectedImage);

    try {
      this.uploadingImage = true;
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Fehler beim Hochladen des Bildes');
      return null;
    } finally {
      this.uploadingImage = false;
    }
  }

  async saveProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    // Upload image first if one is selected
    let imageUrl: string | null = null;
    if (this.selectedImage) {
      imageUrl = await this.uploadImage();
      if (imageUrl === null) {
        // Upload failed, stop the save process
        return;
      }
    }

    const formValue = this.productForm.value;
    
    // Convert boolean string values back to actual booleans for consistency
    const dynamicFields = (formValue.dynamicFields || []).map((field: any) => {
      if (field.type === 'boolean') {
        return {
          ...field,
          value: field.value === 'true' || field.value === true
        };
      }
      return field;
    });
    
    const productData: InsertProduct = {
      name: formValue.name,
      sku: formValue.sku,
      description: formValue.description,
      price: formValue.price,
      stock: formValue.stock,
      imageUrl: imageUrl || undefined,
      catalogId: formValue.catalogId || undefined,
      active: formValue.active,
      featured: formValue.featured,
      dynamicFields: dynamicFields
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateArticle(this.productId, productData).subscribe({
        next: () => {
          alert('Produkt erfolgreich aktualisiert!');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error updating product:', err);
          alert('Fehler beim Aktualisieren des Produkts. Bitte versuchen Sie es erneut.');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          alert('Produkt erfolgreich erstellt!');
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error creating product:', err);
          alert('Fehler beim Erstellen des Produkts. Bitte versuchen Sie es erneut.');
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset({
      active: true,
      featured: false
    });
    this.dynamicFields.clear();
    this.selectedImage = null;
    this.imagePreview = null;
  }

  cancelForm(): void {
    if (confirm('Möchten Sie wirklich abbrechen? Alle ungespeicherten Änderungen gehen verloren.')) {
      this.router.navigate(['/products']);
    }
  }
}
