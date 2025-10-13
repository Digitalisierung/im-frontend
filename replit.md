# Product Catalog Management System

## Overview

A full-stack product catalog management application built with Angular frontend and Express backend. The system enables dynamic product creation with customizable fields, catalog organization, and comprehensive CRUD operations. Products can have flexible attributes added at runtime, making it suitable for diverse product types and categories.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Angular 20.3.2 (Standalone Components)
- The application uses Angular's modern standalone component architecture, eliminating the need for NgModules
- Reactive programming patterns with RxJS for state management and asynchronous operations
- Bootstrap 5.3.0 for UI components and responsive layout
- Bootstrap Icons for iconography

**Component Structure**:
- **Layout Components**: Sidebar and Topbar for navigation and header
- **Page Components**: Dashboard, Products list, Product form (new/edit), Catalogs management
- **Routing**: Client-side routing with lazy loading capabilities via Angular Router

**Form Handling**:
- Angular Reactive Forms for dynamic product forms
- Custom dynamic field system allowing users to add/remove fields at runtime
- Field types supported: text, number, boolean, date
- Form validation using Angular's built-in validators

**State Management**:
- Service-based architecture for API communication
- HttpClient for REST API calls
- Observable streams for reactive data flow

**UI Framework Decision**:
- **Problem**: Need consistent, responsive UI components
- **Solution**: Bootstrap 5 with custom CSS variables
- **Alternative**: Could use Angular Material, but Bootstrap chosen for familiarity and rapid development
- **Pros**: Quick implementation, extensive component library, mobile-first
- **Cons**: Less Angular-specific integration compared to Material

### Backend Architecture

**Runtime**: Node.js with Express.js framework
- TypeScript for type safety across the entire backend
- ESM (ECMAScript Modules) format for modern JavaScript features
- Development server with hot-reload via tsx

**API Layer**:
- RESTful API design following standard HTTP methods
- JSON request/response format
- Route handlers in `/server/routes.ts`
- Middleware for logging, JSON parsing, and error handling

**Storage Layer**:
- **Current**: In-memory storage implementation (MemStorage class)
- **Design Pattern**: Storage interface (IStorage) allows swapping implementations
- **Future-Ready**: Can easily switch to database-backed storage (PostgreSQL via Drizzle ORM)

**Data Models** (shared between frontend/backend):
- Users: Basic authentication structure (username, password)
- Catalogs: Product categories with name, description, color coding
- Products: Core product info plus dynamic fields stored as JSONB
  - Fixed fields: name, SKU, price, stock, catalog association
  - Dynamic fields: Flexible key-value pairs for custom attributes
  - Boolean flags: active, featured

**Storage Architecture Decision**:
- **Problem**: Need flexible data persistence that can scale
- **Solution**: Interface-based storage with in-memory default
- **Alternative**: Direct database implementation from start
- **Pros**: Quick development, easy testing, clean migration path
- **Cons**: Data loss on restart, not production-ready without database

### Build System

**Bundler**: Vite for frontend, esbuild for backend
- Vite provides fast HMR (Hot Module Replacement) in development
- Production builds optimize and bundle React/Angular code
- esbuild bundles server code for production deployment

**TypeScript Configuration**:
- Strict type checking enabled
- Path aliases for clean imports (@/, @shared/, @assets/)
- Incremental compilation for faster rebuilds

**Development Workflow**:
- `npm run dev`: Runs backend server with Vite middleware for frontend
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs production build

### Database Schema (Drizzle ORM)

**ORM**: Drizzle with PostgreSQL dialect
- Schema defined in `/shared/schema.ts` using Drizzle's table definitions
- Zod integration for runtime validation via drizzle-zod
- Migration support via drizzle-kit

**Tables**:
1. **Users**: Authentication and user management
   - UUID primary key (auto-generated)
   - Unique username constraint
   
2. **Catalogs**: Product categorization
   - UUID primary key
   - Color coding for visual organization
   - Timestamp tracking
   
3. **Products**: Core product data
   - UUID primary key
   - SKU with unique constraint
   - Foreign key to catalogs
   - JSONB field for dynamic attributes
   - Boolean flags for active/featured status

**Schema Design Decision**:
- **Problem**: Need flexible product attributes that vary by type
- **Solution**: JSONB dynamic fields alongside fixed schema
- **Alternative**: EAV (Entity-Attribute-Value) pattern
- **Pros**: Type safety for core fields, flexibility for custom data, good query performance
- **Cons**: JSONB queries less optimized than native columns

## External Dependencies

### Third-Party Services

**Database**: Neon Serverless PostgreSQL (@neondatabase/serverless)
- Serverless PostgreSQL database optimized for edge deployments
- HTTP-based connection pooling
- Compatible with Drizzle ORM

### UI Libraries

**Shadcn/UI Components**: Extensive Radix UI integration
- Accessible, unstyled components wrapped with Tailwind CSS
- Components include: Dialog, Dropdown, Toast, Forms, Tables, etc.
- Customizable via CSS variables defined in index.css

**React Ecosystem** (Note: Legacy/mixed with Angular):
- React 18+ for some UI components
- TanStack Query (@tanstack/react-query) for data fetching
- Wouter for lightweight routing
- React Hook Form with Zod validation

**Styling**:
- Tailwind CSS for utility-first styling
- PostCSS for CSS processing
- Autoprefixer for browser compatibility
- Custom CSS variables for theming

### Development Tools

**Replit Integration**:
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code navigation
- @replit/vite-plugin-dev-banner for development indicators

**Code Quality**:
- TypeScript for static typing
- ESLint/TSConfig for code standards
- Drizzle Kit for database migrations

### API Communication

**Backend Target**: `http://localhost:8080`
- Proxy configuration in `client/proxy.conf.json` routes `/api` requests
- CORS and credentials handling for cross-origin requests
- RESTful endpoints for all CRUD operations

**API Endpoints**:
- GET/POST/PUT/DELETE `/api/catalogs` - Catalog management
- GET/POST/PUT/DELETE `/api/products` - Product management
- Catalog-Product assignment endpoints for relationships