export interface DynamicField {
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date';
    value: any;
}

export interface Product {
    id?: string;
    name: string; // check
    sku: string; // check
    description?: string; // check
    price?: number;
    stock?: number; // check
    imageUrl?: string; // check
    catalogId?: string; // check
    active: boolean;
    featured: boolean; // isFeatured
    dynamicFields: DynamicField[];
    createdAt?: string; // check
    updatedAt?: string; // check
    entityType: string; // check
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
