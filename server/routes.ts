import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCatalogSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "server", "public", "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading file", error });
    }
  });

  // Catalog routes
  app.get("/api/catalogs", async (_req, res) => {
    try {
      const catalogs = await storage.getCatalogs();
      res.json(catalogs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching catalogs" });
    }
  });

  app.get("/api/catalogs/:id", async (req, res) => {
    try {
      const catalog = await storage.getCatalog(req.params.id);
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      res.json(catalog);
    } catch (error) {
      res.status(500).json({ message: "Error fetching catalog" });
    }
  });

  app.post("/api/catalogs", async (req, res) => {
    try {
      const validatedData = insertCatalogSchema.parse(req.body);
      const catalog = await storage.createCatalog(validatedData);
      res.status(201).json(catalog);
    } catch (error) {
      res.status(400).json({ message: "Invalid catalog data", error });
    }
  });

  app.put("/api/catalogs/:id", async (req, res) => {
    try {
      const validatedData = insertCatalogSchema.partial().parse(req.body);
      const catalog = await storage.updateCatalog(req.params.id, validatedData);
      if (!catalog) {
        return res.status(404).json({ message: "Catalog not found" });
      }
      res.json(catalog);
    } catch (error) {
      res.status(400).json({ message: "Invalid catalog data", error });
    }
  });

  app.delete("/api/catalogs/:id", async (req, res) => {
    try {
      await storage.deleteCatalog(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting catalog" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      let products = await storage.getProducts();
      
      // Filter by search text
      const search = req.query.search as string | undefined;
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          (Array.isArray(p.dynamicFields) && p.dynamicFields.some((f: any) => 
            typeof f.value === 'string' && f.value.toLowerCase().includes(searchLower)
          ))
        );
      }
      
      // Filter by catalog
      const catalogId = req.query.catalogId as string | undefined;
      if (catalogId) {
        products = products.filter(p => p.catalogId === catalogId);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // Bulk operations (must be before parameterized routes)
  app.put("/api/products/bulk/catalog", async (req, res) => {
    try {
      const { productIds, catalogId } = req.body;
      
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }
      
      const updates = await Promise.all(
        productIds.map(id => storage.updateProduct(id, { catalogId: catalogId || undefined }))
      );
      
      const successful = updates.filter(u => u !== undefined).length;
      res.json({ message: `${successful} products updated`, updated: successful });
    } catch (error) {
      res.status(500).json({ message: "Error updating products" });
    }
  });

  app.delete("/api/products/bulk", async (req, res) => {
    try {
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }
      
      await Promise.all(productIds.map(id => storage.deleteProduct(id)));
      
      res.json({ message: `${productIds.length} products deleted`, deleted: productIds.length });
    } catch (error) {
      res.status(500).json({ message: "Error deleting products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
