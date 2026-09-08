export interface Catalog {
  id?: string;
  name: string;
  description?: string;
  color: string;
  articleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsertCatalog {
  name: string;
  description?: string;
  color: string;
}
