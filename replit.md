# Booking Form Application

## Overview

This is a full-stack booking form application built with React, Express.js, and PostgreSQL. The application allows users to book various cleaning services through an interactive multi-step form with real-time pricing calculations and a comprehensive service selection system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (upgraded from in-memory storage)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Pattern**: RESTful API with JSON responses
- **Data Persistence**: Full PostgreSQL integration with automatic migrations

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared types and schemas between frontend and backend
- `migrations/` - Database migration files

## Key Components

### Database Schema
- **Users Table**: User accounts with authentication credentials
- **Bookings Table**: Stores all booking information including service details, customer info, pricing, and scheduling
- **Service Extras Table**: Configurable add-on services with pricing per service type (24 pre-seeded extras)
- **Schema Definition**: Located in `shared/schema.ts` using Drizzle ORM with Zod validation
- **Database Operations**: Full CRUD operations via DatabaseStorage class

### API Endpoints
- `GET /api/service-extras/:serviceType` - Fetch available extras for a service type
- `POST /api/bookings` - Create a new booking with validation
- `GET /api/bookings/:id` - Retrieve booking details by ID

### Form Components
- **BookingForm**: Main multi-step form with service selection, property details, scheduling, and customer information
- **PricingSidebar**: Real-time pricing calculator with service breakdown
- **Service Selection**: Dynamic form fields based on selected service type

### Service Types
1. General/Standard Cleaning
2. Deep Cleaning  
3. End of Tenancy Cleaning
4. AirBnB Cleaning
5. Jet Washing/Garden Cleaning
6. Commercial Cleaning

## Data Flow

1. **Form Initialization**: Load saved form data from localStorage if available
2. **Service Selection**: User selects service type, triggering dynamic form field updates
3. **Property Details**: Conditional fields based on service type (room counts vs. surface details)
4. **Extras Loading**: Fetch available extras from API based on selected service
5. **Real-time Pricing**: Calculate base price + extras + tips with live updates
6. **Form Submission**: Validate and submit booking data to backend API
7. **Data Persistence**: Store booking in PostgreSQL with generated ID

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **HTTP Client**: Fetch API with TanStack Query wrapper
- **Form Validation**: React Hook Form with Zod schemas
- **Date Handling**: date-fns for date calculations
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: connect-pg-simple for PostgreSQL session store
- **Validation**: Zod for runtime type checking
- **Build Tools**: esbuild for server bundling, tsx for development

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite build outputting to `dist/public`
- **Backend**: esbuild bundle outputting to `dist/index.js`
- **Database**: Drizzle push for schema deployment
- **Static Files**: Express serves frontend build from `dist/public`

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Build Mode**: `NODE_ENV` for development/production switching
- **Replit Integration**: Special handling for Replit deployment environment

### Key Architectural Decisions

1. **Shared Schema**: Common TypeScript types and Zod schemas between frontend and backend ensure type safety and validation consistency
2. **Real-time Pricing**: Client-side calculation with server-side validation provides responsive UX while maintaining data integrity
3. **Conditional Forms**: Dynamic form fields based on service selection reduce cognitive load and improve user experience
4. **Session-based Storage**: PostgreSQL sessions provide scalable user state management
5. **Database-First Storage**: Full PostgreSQL integration with automatic schema migrations and data persistence
6. **Serverless Database**: Neon Database provides scalable PostgreSQL without infrastructure management
7. **Automated Seeding**: Pre-populated service extras for immediate functionality

## Recent Changes

### January 11, 2025 - Database Integration
- **Replaced in-memory storage with PostgreSQL database**
- **Added DatabaseStorage class** with full CRUD operations
- **Created database schema** with users, bookings, and service_extras tables
- **Implemented automatic database seeding** with 24 service extras across 6 service types
- **Fixed React infinite loop** by memoizing callback functions
- **Resolved all TypeScript compilation errors**
- **Successfully tested end-to-end** database operations with multiple booking types