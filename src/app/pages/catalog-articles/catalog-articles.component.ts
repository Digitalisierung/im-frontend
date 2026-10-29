import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {Article} from "@/app/models/article.model";
import {Catalog} from "@/app/models/catalog.model";
import {ArticleService} from "@/app/services/article.service";
import {CatalogService} from "@/app/services/catalog.service";
import {ArticleDetailModalComponent} from "@/app/components/article-detail-modal.component";

declare var bootstrap: any;

@Component({
  selector: 'app-catalog-articles',
  imports: [
    RouterLink, CommonModule, FormsModule, ArticleDetailModalComponent
  ],
  templateUrl: './catalog-articles.component.html',
  styleUrl: './catalog-articles.component.css',
})
export class CatalogArticlesComponent implements OnInit {
  articles: Article[] = [];
  allCatalogs: Catalog[] = [];

  catalog: Catalog | undefined;

  isLoading: boolean = false;
  selectedArticles: Set<string> = new Set();
  bulkCatalogId = '';

  selectedArticle: Article | null = null;
  selectedInventarCatalogName: string | null = null;
  selectedInventarCatalogColor: string = 'secondary';

  constructor(
      private articleService: ArticleService,
      private catalogService: CatalogService,
      private activatedRoute: ActivatedRoute,
      private route: Router
  ) {
  }

  ngOnInit(): void {
    const catalogId = this.activatedRoute.snapshot.paramMap.get('catalogId');
    if (catalogId) {
      this.loadArticles(catalogId);
      this.loadCatalog(catalogId);
      this.loadCatalogs();
    } else {
      this.route.navigate(['/catalogs']);
    }
  }

  // TODO: Filterung und Suche muss im Frontend passierent, nicht im Backend. Siehe PrimeNG.
  loadArticles(catalogId: string): void {
    this.isLoading = true;
    this.articleService.getCatalogArticles(catalogId).subscribe({
      next: (articles: Article[]): void => {
        this.articles = articles;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.isLoading = false;
      }
    });
  }

  loadCatalog(catalogId: string): void {
    this.isLoading = true;
    this.catalogService.getCatalog(catalogId).subscribe({
      next: (catalog: Catalog): void => {
        this.catalog = catalog;
        this.isLoading = false;
      },
      error: (err): void => {
        console.error("Failing to load catalog:", err);
        this.isLoading = false;
      }
    });
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogs().subscribe({
      next: (catalogs: Catalog[]) => {
        this.allCatalogs = catalogs;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
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

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.articles.forEach(p => p.id && this.selectedArticles.add(p.id));
    } else {
      this.selectedArticles.clear();
    }
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

  onArticleDoubleClick(article: Article): void {
    this.selectedArticle = article;
    this.selectedInventarCatalogName = this.catalog?.name || 'Unbekannt';
    this.selectedInventarCatalogColor = this.catalog?.color || 'secondary';

    const modalElement = document.getElementById('catalogArticleDetailModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // TODO: ab da nocht nicht vollständig implementiert.
  deleteArticle(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) {
      return;
    }

    this.articleService.deleteArticle(id).subscribe({
      next: () => {
        let catalogId = this.catalog?.id;
        if (catalogId) {
          this.loadArticles(catalogId);
        }
      },
      error: (err) => console.error('Error deleting article:', err)
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
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({productIds: articleIds})
    })
        .then(async response => {
          if (!response.ok) {
            throw new Error('Delete failed');
          }
          // Handle both JSON and 204 No Content responses
          if (response.status === 204) {
            return {message: 'Artikel erfolgreich gelöscht'};
          }
          return response.json();
        })
        .then(data => {
          alert(data.message || 'Artikel erfolgreich gelöscht');
          this.selectedArticles.clear();
          // this.loadArticles(); TODO: muss nur für Artikel des Katalogs gelten.
        })
        .catch(err => {
          console.error('Error deleting articles:', err);
          alert('Fehler beim Löschen der Artikel');
        });
  }


  bulkAssignCatalog(): void {
    if (this.selectedArticles.size === 0) return;

    const articleIds = Array.from(this.selectedArticles);
    const catalogId = this.bulkCatalogId || null;

    fetch('/api/articles/bulk/catalog', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({productIds: articleIds, catalogId})
    })
        .then(response => response.json())
        .then(data => {
          alert(data.message || 'Artikel erfolgreich aktualisiert');
          this.selectedArticles.clear();
          this.bulkCatalogId = '';
          // this.loadArticles(); TODO: muss nur für Artikel des Katalogs gelten.
        })
        .catch(err => {
          console.error('Error updating articles:', err);
          alert('Fehler beim Aktualisieren der Artikel');
        });
  }
}
