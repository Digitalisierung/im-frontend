export interface ArticleDto {
    entityType: string;
    description: string;
    createdAt: string;
    sortKey: string;
    catalogId: string;
    partitionKey: string;
    imageUrl: string;
    name: string;
    state: string;
    sku: string;
    stock: number;
    isFeatured: boolean;
    updatedAt: string;
}