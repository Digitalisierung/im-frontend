export interface Article {
    entityType: string; // "ARTICLES"
    description: string;
    createdAt: string;
    sortKey: string;
    catalogId: string;
    partitionKey: string;
    imageUrl: string; //"https://stock-images.s3.eu-central-1.amazonaws.com/isfahan_carpet.jpg",
    name: string; // "Persischer Teppich 'Isfahan'",
    state: string; //"UNDER_EVALUATION",
    sku: string; // "SKU-7006",
    stock: number; // 1,
    isFeatured: boolean; // false,
    updatedAt: string; //"2024-02-25T09:30:00Z"
}