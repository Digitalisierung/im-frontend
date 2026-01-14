export interface Catalog {
  id?: string;
  name: string;
  description?: string;
  color: string;
  productCount?: number;
  createdAt?: string;
}

export interface InsertCatalog {
  name: string;
  description?: string;
  color: string;
}
