import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';
import { Catalog, InsertCatalog } from '../models/catalog.model';
import {environment} from "@/environments/environment";
import {CatalogPaginationResponse} from "@/app/dto/catalog.pagination.response";


@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = `${environment.apiBaseUrl}/catalogs`;

  constructor(private http: HttpClient) {}

  getCatalogs(): Observable<Catalog[]> {
    return this.http.get<CatalogPaginationResponse>(this.apiUrl).pipe(
        map(response => response.catalogs),
        catchError((error) => {
          console.error("ERROR => ", error);
          return of([]);
        })
    );
  }

  getCatalog(id: string): Observable<Catalog> {
    return this.http.get<Catalog>(`${this.apiUrl}/${id}`);
  }

  createCatalog(catalog: InsertCatalog): Observable<Catalog> {
    return this.http.post<Catalog>(this.apiUrl, catalog);
  }

  updateCatalog(id: string, catalog: Partial<Catalog>): Observable<Catalog> {
    return this.http.put<Catalog>(`${this.apiUrl}/${id}`, catalog);
  }

  deleteCatalog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignProduct(catalogId: string, productId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${catalogId}/products`, { productId });
  }

  removeProduct(catalogId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${catalogId}/products/${productId}`);
  }
}
