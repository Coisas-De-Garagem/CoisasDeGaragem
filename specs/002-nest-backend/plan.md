# Implementation Plan: NestJS Backend

**Feature**: `002-nest-backend`
**Spec**: [spec.md](./spec.md)
**Status**: Planned

## Summary

Build a robust REST API using NestJS to power the CoisasDeGaragem frontend. The backend will use Prisma with PostgreSQL for persistence and JWT for secure authentication. The system will be containerized using Docker for the database.

## Technical Context

- **Runtime**: Node.js (LTS)
- **Framework**: NestJS
- **Database**: PostgreSQL 15+ (running in Docker)
- **ORM**: Prisma
- **Auth**: JWT (JSON Web Tokens)
- **API Standard**: REST
- **Environment**: `.env` configuration

## Implementation Phases

### Phase 1: Foundation & Infrastructure
- [ ] **Project Setup**: Initialize NestJS project (`nest new backend`).
- [ ] **Docker Setup**: Create `docker-compose.yml` for PostgreSQL.
- [ ] **Prisma Setup**: Initialize Prisma, configure connection, create `schema.prisma`.
- [ ] **Config**: Set up `ConfigModule` for environment variables.
- [ ] **Common**: Create common DTOs, filters (Global Exception Filter), and interceptors (Response Transform).

### Phase 2: Core Identity (Auth & Users)
- [ ] **Users Module**: Create User entity, service, and controller.
- [ ] **Auth Module**: Implement Login, Register, JWT strategy, Guards (`JwtAuthGuard`).
- [ ] **RBAC**: Implement Role-based access control (`@Roles('seller')`, `@Roles('buyer')`).
- [ ] **Profile**: Implement `/me` endpoint.

### Phase 3: Seller Features
- [ ] **Products Module**: CRUD for Products. Ensure logic checks ownership (Seller can only edit their own products).
- [ ] **Uploads**: Implement simple file upload for Product Images (local storage or S3 mock).
- [ ] **QR Generation**: Implement service to generate unique QR codes for products.
- [ ] **Analytics**: Basic endpoint aggregating sales data for the seller dashboard.

### Phase 4: Buyer Features & Transactions
- [ ] **Sales/Transactions Module**: Handle Purchase creation.
- [ ] **Transaction Logic**: Atomic transactions using Prisma (`$transaction`).
    - Verify product availability.
    - Create Purchase record.
    - Update Product status to 'sold'.
- [ ] **History**: Endpoints for Buyer purchase history.

### Phase 5: Documentation & Seeding
- [ ] **Swagger**: Configure Swagger UI for API documentation.
- [ ] **Seed Script**: Create `seed.ts` to populate DB with initial mock data (matching frontend mocks).
- [ ] **CORS**: Configure CORS to allow requests from the React frontend.

## Directory Structure

```text
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/          # Decorators, Guards, Filters
│   ├── config/          # Configuration service
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── sales/
│   │   └── analytics/
│   └── prisma/          # Prisma service
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
└── package.json
```
