import {Product} from "@/app/models/product.model";

export interface ArticlePaginationResponse {
    articles: string;
    nextToken?: string;
    totalReturned?: number;
    hasMore?: boolean;
}