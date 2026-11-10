import {DynamicField} from "@/app/models/article.model";

export interface InsertArticle {
    name: string;
    sku: string;
    description?: string;
    price?: number;
    stock: number;
    imageUrl?: string;
    catalogId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    createdAt: string;
    updatedAt?: string;
    dynamicFields: DynamicField[];
}
