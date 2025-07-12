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

### January 11, 2025 - Database Integration & Service Extras Update
- **Replaced in-memory storage with PostgreSQL database**
- **Added DatabaseStorage class** with full CRUD operations
- **Created database schema** with users, bookings, and service_extras tables
- **Implemented comprehensive service extras system** with 27 specific additional services
- **Updated service pricing** to match client specifications (Standard £20/hr, Deep £30/hr, Tenancy £30/hr)
- **Added quote-based pricing** for AirBnB, Jet Washing, and Commercial services
- **Fixed additional services selection** with proper checkbox handling and auto-display
- **Enhanced pricing sidebar** to show individual selected extras with names and prices
- **Resolved all TypeScript compilation errors**
- **Successfully tested end-to-end** database operations with multiple booking types including selected extras

### January 11, 2025 - Post-Booking System Implementation
- **RESOLVED CRITICAL INFINITE LOOP** - Eliminated all problematic useEffect hooks causing infinite re-renders
- **Added comprehensive error boundaries** to prevent application crashes
- **Implemented PDF receipt generation** using jsPDF with complete booking details and pricing breakdown
- **Created booking confirmation page** with professional layout showing all booking information
- **Added email notification system** using Nodemailer for both customer and company owner
- **Implemented automatic redirect** from booking form to confirmation page after successful booking
- **Added download PDF functionality** with proper file naming and blob handling
- **Enhanced customer experience** with detailed confirmation page and next steps information
- **Integrated email templates** with professional styling and complete booking details
- **Tested complete post-booking flow** from form submission to PDF generation and email notifications

### January 12, 2025 - Enhanced Property Details & UI Restructuring
- **REDESIGNED PROPERTY DETAILS SECTION** - Modeled after user-provided image structure with dropdown selectors
- **EXPANDED ROOM-BASED PRICING** - Added Kitchen, Utility Room, and Carpet Cleaning to dynamic pricing calculations
- **IMPLEMENTED COMPREHENSIVE DROPDOWNS** - All room types now use Select components with 0-10 options
- **ADDED SQUARE FOOTAGE RANGES** - Categorized property sizes (1-1200, 1201-2000, 2001-3000, etc.)
- **ENHANCED DYNAMIC PRICING** - Kitchen (£25/hr), Utility Room (£15/30min), Carpet Cleaning (£35/hr)
- **UPDATED DATABASE SCHEMA** - Added kitchen, utilityRoom, and carpetCleaning fields to bookings table
- **IMPROVED PRICING DISPLAY** - Shows "Dynamic (based on rooms)" for Deep Cleaning and End of Tenancy services
- **REFINED FORM LAYOUT** - Two-column layout matching uploaded image structure for better user experience
- **COMPREHENSIVE TESTING** - Verified all new room types calculate correctly in pricing and persist to database
- **MAINTAINED INFINITE LOOP PREVENTION** - All new dropdowns use direct state management without problematic useEffect hooks

### January 12, 2025 - Bug Fixes & Service Optimization
- **RESOLVED CRITICAL INFINITE LOOP** - Fixed maximum update depth exceeded error that was causing app crashes
- **ENHANCED STATE MANAGEMENT** - Improved callback functions with proper change detection to prevent unnecessary re-renders
- **REMOVED DUPLICATE SERVICES** - Cleaned up additional services to eliminate repetition with property details section
- **OPTIMIZED SERVICE EXTRAS** - Removed bedroom, bathroom, cloakroom, kitchen, reception room, utility room, and carpet cleaning from additional services since they're handled in property details
- **STREAMLINED USER EXPERIENCE** - Reduced form complexity and confusion by avoiding duplicate service selections
- **UPDATED DATABASE SEEDING** - Refreshed service extras to include only non-duplicate items like conservatory, patio/balcony, study, and hallway/staircase
- **MAINTAINED FUNCTIONALITY** - All core booking features remain intact with improved performance and user experience

### January 12, 2025 - Quantity-Based Additional Services
- **IMPLEMENTED QUANTITY SELECTION** - Replaced checkbox system with +/- buttons for selecting multiple quantities of additional services
- **ENHANCED PRICING CALCULATION** - Updated pricing logic to properly handle quantities (e.g., 2 dryers = 2 × £20 = £40)
- **IMPROVED USER INTERFACE** - Added quantity counters with visual feedback showing individual and total prices
- **UPDATED PRICING SIDEBAR** - Shows quantities in format "Service Name (x2)" with calculated totals
- **ENHANCED BOOKING SUMMARY** - Displays selected extras with quantities for review before submission
- **MAINTAINED FORM PERSISTENCE** - Quantities are saved and restored when form data is preserved
- **STREAMLINED SELECTION PROCESS** - Customers can now easily select multiple quantities of services like appliances, furniture, and room cleaning

### January 12, 2025 - Form Submission & Flow Fixes
- **FIXED REACT RENDERING ERROR** - Resolved "Objects are not valid as a React child" error in TIME_SLOTS mapping
- **CORRECTED FORM FLOW** - Added missing "Continue to Customer Details" button after time selection
- **ENHANCED FORM VALIDATION** - Improved booking submission with proper field conversion and validation
- **IMPROVED ERROR HANDLING** - Added detailed error messages and console logging for debugging
- **MAINTAINED PDF & EMAIL INTEGRATION** - Ensured booking confirmation works with PDF generation and email notifications
- **TESTED COMPLETE FLOW** - Verified end-to-end booking process from service selection to confirmation

### January 12, 2025 - AirBnB Special Pricing Implementation
- **IMPLEMENTED BEDROOM-BASED PRICING** - AirBnB cleaning duration: 1 bedroom = 2hrs, 2 bedrooms = 3hrs, up to 5 bedrooms
- **ADDED FIXED HOURLY RATE** - AirBnB service charge at £20/hour for all bedroom configurations
- **CREATED AIRBNB-SPECIFIC SERVICES** - Added Internal Laundry (FREE), External Laundry (£20/bed set), and Ironing Service (£15)
- **UPDATED PRICING CALCULATION** - Modified booking-utils.ts to handle special AirBnB pricing logic
- **ENHANCED FORM INTERFACE** - Added bedroom selection dropdown with real-time duration display
- **UPDATED PRICING SIDEBAR** - Shows "bedroom-based" duration indication for AirBnB services
- **SEEDED DATABASE** - Added 3 new AirBnB-specific service extras to database
- **MAINTAINED CONSISTENCY** - All other service types remain unchanged with existing pricing structures

### January 12, 2025 - Complete State Reset Implementation
- **IMPLEMENTED COMPLETE STATE RESET** - Added comprehensive cleanup in onSuccess callback to prevent old data persistence
- **ADDED SESSION FLAG SYSTEM** - Created markBookingCompleted() and isBookingCompleted() functions to prevent loading old data after successful booking
- **ENHANCED FORM INITIALIZATION** - Modified getInitialFormData() to check booking completion status before loading saved data
- **ADDED MANUAL RESET BUTTON** - Implemented "Start New Booking" button on booking page for manual form reset
- **RESOLVED FORM PERSISTENCE ISSUE** - Fixed problem where old form data would persist visually after successful booking
- **COMBINED RESET SOLUTIONS** - Integrated localStorage cleanup with React state reset for maximum reliability
- **IMPROVED USER EXPERIENCE** - Ensures clean form state for new customers while maintaining convenience for active users