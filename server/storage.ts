import { type User, type InsertUser, type Product, type InsertProduct, type Catalog, type InsertCatalog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Catalog methods
  getCatalogs(): Promise<Catalog[]>;
  getCatalog(id: string): Promise<Catalog | undefined>;
  createCatalog(catalog: InsertCatalog): Promise<Catalog>;
  updateCatalog(id: string, catalog: Partial<InsertCatalog>): Promise<Catalog | undefined>;
  deleteCatalog(id: string): Promise<void>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private catalogs: Map<string, Catalog>;
  private products: Map<string, Product>;

  constructor() {
    this.users = new Map();
    this.catalogs = new Map();
    this.products = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Catalog methods
  async getCatalogs(): Promise<Catalog[]> {
    const catalogsArray = Array.from(this.catalogs.values());
    return catalogsArray.map(catalog => ({
      ...catalog,
      productCount: Array.from(this.products.values()).filter(p => p.catalogId === catalog.id).length
    } as any));
  }

  async getCatalog(id: string): Promise<Catalog | undefined> {
    const catalog = this.catalogs.get(id);
    if (!catalog) return undefined;
    return {
      ...catalog,
      productCount: Array.from(this.products.values()).filter(p => p.catalogId === id).length
    } as any;
  }

  async createCatalog(insertCatalog: InsertCatalog): Promise<Catalog> {
    const id = randomUUID();
    const catalog: Catalog = {
      id,
      name: insertCatalog.name,
      description: insertCatalog.description ?? null,
      color: insertCatalog.color ?? 'primary',
      createdAt: new Date(),
    };
    this.catalogs.set(id, catalog);
    return catalog;
  }

  async updateCatalog(id: string, catalogUpdate: Partial<InsertCatalog>): Promise<Catalog | undefined> {
    const catalog = this.catalogs.get(id);
    if (!catalog) return undefined;
    
    const updated: Catalog = { ...catalog, ...catalogUpdate };
    this.catalogs.set(id, updated);
    return updated;
  }

  async deleteCatalog(id: string): Promise<void> {
    this.catalogs.delete(id);
    // Update products that belong to this catalog
    for (const [productId, product] of Array.from(this.products.entries())) {
      if (product.catalogId === id) {
        this.products.set(productId, { ...product, catalogId: null });
      }
    }
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      name: insertProduct.name,
      sku: insertProduct.sku,
      description: insertProduct.description ?? null,
      price: insertProduct.price ?? null,
      stock: insertProduct.stock ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      catalogId: insertProduct.catalogId ?? null,
      active: insertProduct.active ?? true,
      featured: insertProduct.featured ?? false,
      dynamicFields: insertProduct.dynamicFields ?? [],
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updated: Product = { ...product, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }
}

export const storage = new MemStorage();
