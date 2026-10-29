import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ArticleService} from '../../services/article.service';
import {CatalogService} from '../../services/catalog.service';
import {Article} from '../../models/article.model';
import {Catalog} from '../../models/catalog.model';
import {ArticleDetailModalComponent} from '../../components/article-detail-modal.component';

declare var bootstrap: any;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ArticleDetailModalComponent],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  catalogs: Catalog[] = [];
  
  searchQuery = '';
  filterCatalog = '';
  filterStatus = '';
  
  isLoading = false;
  selectedArticles: Set<string> = new Set();
  bulkCatalogId = '';
  
  selectedArticle: Article | null = null;
  selectedInventarCatalogName: string | null = null;
  selectedInventarCatalogColor: string = 'secondary';

  constructor(
    private articleService: ArticleService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadArticles();
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  loadArticles(): void {
    this.isLoading = true;
    // Use backend filtering for search and catalog
    this.articleService.getArticles(
      this.searchQuery || undefined, 
      this.filterCatalog || undefined
    ).subscribe({
      next: (articles) => {
        // Apply client-side status filter if needed
        if (this.filterStatus) {
          this.articles = articles.filter(article =>
              (this.filterStatus === 'active' && article.isActive) ||
              (this.filterStatus === 'inactive' && !article.isActive)
          );
        } else {
          this.articles = articles;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadArticles();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.filterCatalog = '';
    this.filterStatus = '';
    this.loadArticles();
  }

  deleteArticle(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) {
      return;
    }

    this.articleService.deleteArticle(id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (err) => console.error('Error deleting article:', err)
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
  toggleArticleSelection(articleId: string | undefined): void {
    if (!articleId) return;
    
    if (this.selectedArticles.has(articleId)) {
      this.selectedArticles.delete(articleId);
    } else {
      this.selectedArticles.add(articleId);
    }
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.articles.forEach(p => p.id && this.selectedArticles.add(p.id));
    } else {
      this.selectedArticles.clear();
    }
  }

  isArticleSelected(articleId: string | undefined): boolean {
    return articleId ? this.selectedArticles.has(articleId) : false;
  }

  get allSelected(): boolean {
    return this.articles.length > 0 && this.articles.every(p => this.isArticleSelected(p.id));
  }

  get hasSelection(): boolean {
    return this.selectedArticles.size > 0;
  }

  bulkAssignCatalog(): void {
    if (this.selectedArticles.size === 0) return;

    const articleIds = Array.from(this.selectedArticles);
    const catalogId = this.bulkCatalogId || null;

    fetch('/api/articles/bulk/catalog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: articleIds, catalogId })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message || 'Artikel erfolgreich aktualisiert');
        this.selectedArticles.clear();
        this.bulkCatalogId = '';
        this.loadArticles();
      })
      .catch(err => {
        console.error('Error updating articles:', err);
        alert('Fehler beim Aktualisieren der Artikel');
      });
  }

  bulkDelete(): void {
    if (this.selectedArticles.size === 0) return;

    const count = this.selectedArticles.size;
    if (!confirm(`Sind Sie sicher, dass Sie ${count} Artikel löschen möchten?`)) {
      return;
    }

    const articleIds = Array.from(this.selectedArticles);

    fetch('/api/articles/bulk', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: articleIds })
    })
      .then(async response => {
        if (!response.ok) {
          throw new Error('Delete failed');
        }
        // Handle both JSON and 204 No Content responses
        if (response.status === 204) {
          return { message: 'Artikel erfolgreich gelöscht' };
        }
        return response.json();
      })
      .then(data => {
        alert(data.message || 'Artikel erfolgreich gelöscht');
        this.selectedArticles.clear();
        this.loadArticles();
      })
      .catch(err => {
        console.error('Error deleting articles:', err);
        alert('Fehler beim Löschen der Artikel');
      });
  }

  onArticleDoubleClick(article: Article): void {
    this.selectedArticle = article;
    this.selectedInventarCatalogName = this.getCatalogName(article.catalogId);
    this.selectedInventarCatalogColor = this.getCatalogColor(article.catalogId);
    
    const modalElement = document.getElementById('articleDetailModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }
}
