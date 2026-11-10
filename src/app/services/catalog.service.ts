import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable} from 'rxjs';
import {Catalog} from '../models/catalog.model';
import {environment} from "@/environments/environment";
import {CatalogPaginationResponse} from "@/app/dto/catalog.pagination.response";
import {InsertCatalog} from "@/app/dto/insert.catalog";

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = `${environment.apiBaseUrl}/catalogs`;

  constructor(private http: HttpClient) {}

  getCatalogs(): Observable<Catalog[]> {
    let url: string = `${this.apiUrl}`;
    console.log("url", url);
    return this.http.get<CatalogPaginationResponse>(url).pipe(
        map(response => response.catalogs),
        catchError((error) => {
          console.error("An error occurred while retrieving a list of catalogs.", error);
          return of([]);
        })
    );
  }

  getCatalog(id: string): Observable<Catalog> {
    let url: string = `${this.apiUrl}/${id}`;
    return this.http.get<Catalog>(url);
  }

  createCatalog(catalog: InsertCatalog): Observable<Catalog> {
    let url: string = `${this.apiUrl}`;
    return this.http.post<Catalog>(url, catalog);
  }

  updateCatalog(id: string, catalog: Partial<Catalog>): Observable<Catalog> {
    let url: string = `${this.apiUrl}/${id}`;
    return this.http.put<Catalog>(url, catalog).pipe(
      catchError((error) => {
        console.error(`Failed to update catalog with is "${id}"`, error);
        return of({} as Catalog);
      }));
  }

  deleteCatalog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignArticle(catalogId: string, articleId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${catalogId}/articles`, { productId: articleId });
  }

  removeArticle(catalogId: string, articleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${catalogId}/articles/${articleId}`);
  }
}
