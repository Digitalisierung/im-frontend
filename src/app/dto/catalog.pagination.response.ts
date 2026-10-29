import {Catalog} from "@/app/models/catalog.model";

export interface CatalogPaginationResponse {
    catalogs: Catalog[];
    nextToken?: string;
    totalReturned: number;
    hasMore: boolean;
}