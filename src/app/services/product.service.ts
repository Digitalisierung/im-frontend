import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, tap} from 'rxjs';
import {InsertProduct, Product} from '../models/product.model';
import {ArticlePaginationResponse} from '../models/article.pagination.response';
import {Article} from "@/app/models/article.model";
import {environment} from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/api/articles`;

  constructor(private http: HttpClient) {}

  getProducts(search?: string, catalogId?: string): Observable<Product[]> {
    let url = this.apiUrl;
    const params: string[] = [];

    console.log("url => ", url);
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
        tap((value) => {console.log("ARTICLES => ", value.articles);}),
        map((response) => this.mapArticleResponseToProducts(response)),
        catchError((error) => {
          console.error("ERROR = > ", error);
          return of([]);
        })
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`).pipe(
        tap((value) => console.log("ARTICLE => ", value)),
        map((article) => this.buildProductFrom(article))
    );
  }

  createProduct(product: InsertProduct): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapArticleResponseToProducts(response: ArticlePaginationResponse): Product[] {
    const articles = JSON.parse(response.articles) as Article[];

    return articles.map((article) => this.buildProductFrom(article));
  }

  private buildProductFrom(article: Article): Product {
    return {
      id: this.extractIdFromSortKey(article.sortKey),
      name: article.name,
      sku: article.sku,
      description: article.description,
      stock: article.stock,
      imageUrl: article.imageUrl,
      catalogId: article.catalogId,
      active: true, // TODO: entfernen oder state: string = ACTIVE.
      featured: article.isFeatured,
      dynamicFields: [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      entityType: article.entityType
    };
  }

  private extractIdFromSortKey(sortKey: string): string {
    return sortKey.startsWith("ITEM#") ? sortKey.substring("ITEM#".length) : sortKey;
  }
}
