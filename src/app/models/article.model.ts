export interface DynamicField {
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date';
    value: any;
}

export interface Article {
    id?: string;
    name: string;
    sku: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    catalogId?: string;
    active: boolean;
    featured: boolean;
    dynamicFields: DynamicField[];
    createdAt?: string;
    updatedAt?: string;
    entityType: string;
}

export interface InsertArticle {
    name: string;
    sku: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string;
    catalogId?: string;
    active: boolean;
    featured: boolean;
    dynamicFields: DynamicField[];
}
