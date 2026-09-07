export interface ArticlePaginationResponse {
    articles: string;
    nextToken?: string;
    totalReturned?: number;
    hasMore?: boolean;
}