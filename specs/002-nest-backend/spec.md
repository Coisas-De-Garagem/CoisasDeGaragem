# Feature Specification: NestJS Backend

**Feature Branch**: `002-nest-backend`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User request: "create the files in the 002-nest-backend folder following the same pattern... backend in NESTJS, database using PRISMA, authentication using JWT"

## System Overview

This specification defines the backend architecture for the "CoisasDeGaragem" system. The backend will serve as the core logic and data persistence layer, supporting the React frontend. It will be built using NestJS, Prisma ORM, and JWT authentication.

## User Scenarios & API Requirements

### User Story 1 - Public API Access (Priority: P1)

**Context**: The landing page requires access to public data (testimonials, general system info) without authentication.

**Requirements**:
- **AR-001**: API MUST provide public endpoints for fetching visible testimonials.
- **AR-002**: API MUST provide public endpoints for checking system status (health check).

### User Story 2 - User Authentication (Priority: P1)

**Context**: Users (Buyers and Sellers) need to log in to access their respective dashboards.

**Requirements**:
- **AR-003**: API MUST provide an endpoint for User Registration (Sign Up).
- **AR-004**: API MUST provide an endpoint for User Login (returning JWT).
- **AR-005**: API MUST support JWT-based authentication for protected routes.
- **AR-006**: API MUST provide an endpoint to get the current authenticated user's profile (`/me`).

### User Story 3 - Seller Operations (Priority: P2)

**Context**: Sellers manage products, view sales, and check analytics.

**Requirements**:
- **AR-007**: API MUST provide CRUD endpoints for Products (Create, Read, Update, Delete) protected by Seller role.
- **AR-008**: API MUST provide endpoints to view Sales history for the logged-in seller.
- **AR-009**: API MUST provide endpoints to generate/retrieve QR Codes for products.
- **AR-010**: API MUST provide analytics data aggregation (sales count, revenue).

### User Story 4 - Buyer Operations (Priority: P2)

**Context**: Buyers scan QR codes, view purchases, and manage their profile.

**Requirements**:
- **AR-011**: API MUST provide endpoints to record a new Purchase (transaction processing).
- **AR-012**: API MUST provide endpoints to view Purchase history for the logged-in buyer.
- **AR-013**: API MUST provide endpoints to update Buyer profile settings.
- **AR-014**: API MUST provide an endpoint to validate a scanned QR Code and retrieve product details.

## Technical Requirements

### Stack & Tools
- **Framework**: NestJS (latest stable)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma (schema-first design)
- **Authentication**: Passport-JWT, Guards, Decorators
- **Validation**: `class-validator` and `class-transformer`
- **Documentation**: Swagger/OpenAPI (auto-generated)

### Architecture
- **Modules**: Feature-based modules (AuthModule, UsersModule, ProductsModule, SalesModule).
- **Controllers**: Handle HTTP requests and DTO validation.
- **Services**: Business logic and database interaction.
- **Guards**: Role-based access control (RBAC) for Seller/Buyer distinction.

## Success Criteria

- **SC-001**: API successfully connects to the PostgreSQL database via Prisma.
- **SC-002**: Users can register and login, receiving a valid JWT.
- **SC-003**: Protected endpoints reject requests without a valid JWT (401 Unauthorized).
- **SC-004**: Seller endpoints reject requests from Buyer accounts (403 Forbidden).
- **SC-005**: All defined data entities (User, Product, Purchase) are correctly mapped in Prisma Schema.
