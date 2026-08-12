export interface DynamicField {
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date';
    value: any;
}

export interface Product {
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

export interface InsertProduct {
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
