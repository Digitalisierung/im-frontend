import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import {Article, InsertArticle} from '../models/article.model';
import {ArticlePaginationResponse} from '../dto/article.pagination.response';
import {environment} from '@/environments/environment';
import {ArticleDto} from "@/app/dto/article.dto";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl: string = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  getArticles(search?: string, catalogId?: string): Observable<Article[]> {
    let url: string = `${this.apiUrl}/articles`;
    const params: string[] = [];

    console.log("GET: url", url);

    if (search) {
      params.push(`search=${encodeURIComponent(search)}`);
    }
    if (catalogId) {
      params.push(`catalogId=${encodeURIComponent(catalogId)}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<ArticlePaginationResponse>(url).pipe(
        map((response: ArticlePaginationResponse): Article[] => this.mapArticleResponseToArticles(response)),
        catchError((error) => {
          console.error('Error fetching articles:', error);
          return of([]);
        })
    );
  }

  getCatalogArticles(catalogId: string): Observable<Article[]> {
    const url: string = `${this.apiUrl}/catalogs/${catalogId}/articles`

    console.log("GET: url", url);

    return this.http.get<ArticlePaginationResponse>(url).pipe(
        map((response: ArticlePaginationResponse): Article[] => this.mapArticleResponseToArticles(response)),
        catchError((error) => {
          console.error('Failed to fetch articles:', error);
          return of([])
        })
    )
  }

  getArticle(id: string): Observable<Article> {
    const url: string = `${this.apiUrl}/articles/${id}`;

    console.log("GET: url", url);

    return this.http.get<ArticleDto>(url).pipe(
        map((article) => this.buildArticleFrom(article)),
        catchError((error) => {
          console.error('Error fetching article:', error);
          return of({} as Article);
        })
    );
  }

  createArticle(insertArticle: InsertArticle): Observable<Article> {
    const url: string = `${this.apiUrl}/articles`
    console.log("POST: URL", url);
    return this.http.post<Article>(url, insertArticle);
  }

  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapArticleResponseToArticles(response: ArticlePaginationResponse): Article[] {
    const articles = JSON.parse(response.articles) as ArticleDto[];

    return articles.map((article) => this.buildArticleFrom(article));
  }

  private buildArticleFrom(article: ArticleDto): Article {
    let dynFields: any = [];

    if (article.dynamicFields)
      dynFields = article.dynamicFields

    return {
      id: this.extractIdFromSortKey(article.sortKey),
      name: article.name,
      sku: article.sku,
      description: article.description,
      stock: article.stock,
      imageUrl: article.imageUrl,
      catalogId: article.catalogId,
      isActive: true, // TODO: entfernen oder state: string = ACTIVE.
      isFeatured: article.isFeatured,
      dynamicFields: dynFields,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      entityType: article.entityType
    };
  }

  private extractIdFromSortKey(sortKey: string): string {
    return sortKey.startsWith("ITEM#") ? sortKey.substring("ITEM#".length) : sortKey;
  }
}
