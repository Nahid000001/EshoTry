# EshoTry - AI-Powered Fashion E-commerce Platform

## Overview

EshoTry is a full-stack e-commerce platform specializing in fashion retail with AI-powered features. The application is built using a modern tech stack with React frontend, Express.js backend, and PostgreSQL database. The platform focuses on providing an enhanced shopping experience through personalized recommendations and future AI-powered virtual try-on capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Database Schema Design
The application uses PostgreSQL with the following key entities:
- **Users**: Replit Auth integration with profile management
- **Products**: Complete product catalog with categories, pricing, and inventory
- **Categories**: Hierarchical product categorization
- **Shopping Cart**: User-specific cart management
- **Orders**: Complete order lifecycle management
- **Wishlist**: User favorites and saved items

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL sessions table
- **Security**: HTTP-only cookies with secure flags
- **User Management**: Automatic user creation and profile synchronization

### Product Management
- **Categories**: Slug-based product categorization
- **Products**: Rich product data with images, variants, and pricing
- **Search & Filtering**: Server-side filtering by category, price, and search terms
- **Inventory Tracking**: Stock management and availability status

### Shopping Experience
- **Cart Management**: Persistent cart with product variants (size, color)
- **Wishlist**: User favorites with social sharing capabilities
- **Checkout Process**: Multi-step checkout with order management
- **Responsive Design**: Mobile-first approach with desktop optimization

### UI/UX Components
- **Design System**: shadcn/ui components with custom styling
- **Responsive Layout**: Mobile-first design with tablet and desktop breakpoints
- **Accessibility**: ARIA-compliant components and keyboard navigation
- **Performance**: Lazy loading, code splitting, and optimized images

## Data Flow

### User Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect handles authentication
3. User profile is created/updated in PostgreSQL
4. Session is established with secure cookies
5. Protected routes become accessible

### Product Discovery Flow
1. Categories are loaded from database
2. Products are filtered based on user selection
3. Search functionality queries product names and descriptions
4. Results are paginated for optimal performance
5. Product details are loaded on-demand

### Shopping Cart Flow
1. User adds products with selected variants
2. Cart state is persisted in database
3. Real-time cart updates across sessions
4. Checkout process validates inventory
5. Order is created with payment processing

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **express**: Web application framework
- **passport**: Authentication middleware

### Development Dependencies
- **tsx**: TypeScript execution for development
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type checking and compilation

### External Services
- **Replit Auth**: Authentication provider
- **PostgreSQL**: Primary database (via Neon)
- **Replit Deployment**: Hosting and deployment platform

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with TypeScript
- **Database**: PostgreSQL 16 (Replit-managed)
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Port Configuration**: Frontend (Vite) proxies to backend (Express)

### Production Deployment
- **Build Process**: Vite builds static assets, esbuild bundles server
- **Deployment Target**: Replit Autoscale
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS
- **Asset Serving**: Static files served from dist/public

### Database Management
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless with connection pooling
- **Session Storage**: PostgreSQL sessions table with TTL

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```