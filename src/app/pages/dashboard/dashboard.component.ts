import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { CatalogService } from '../../services/catalog.service';
import { Article } from '../../models/article.model';
import { Catalog } from '../../models/catalog.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  articles: Article[] = [];
  catalogs: Catalog[] = [];
  recentArticles: Article[] = [];
  
  totalArticles = 0;
  activeCatalogs = 0;
  newThisWeek = 0;
  unassigned = 0;

  constructor(
    private articleService: ArticleService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.articleService.getArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.totalArticles = articles.length;
        this.recentArticles = articles.slice(0, 3);
        this.unassigned = articles.filter(p => !p.catalogId).length;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        this.newThisWeek = articles.filter(p =>
          p.createdAt && new Date(p.createdAt) > oneWeekAgo
        ).length;
      },
      error: (err) => console.error('Error loading articles:', err)
    });

    this.catalogService.getCatalogs().subscribe({
      next: (catalogs) => {
        this.catalogs = catalogs;
        this.activeCatalogs = catalogs.length;
      },
      error: (err) => console.error('Error loading catalogs:', err)
    });
  }

  deleteArticle(id: string | undefined): void {
    if (!id || !confirm('Sind Sie sicher, dass Sie diesen Artikel löschen möchten?')) {
      return;
    }

    this.articleService.deleteArticle(id).subscribe({
      next: () => {
        this.loadData();
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
}
