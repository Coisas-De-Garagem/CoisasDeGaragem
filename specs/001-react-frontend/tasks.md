---

description: "Task list for React frontend conversion feature implementation"
---

# Tasks: React Frontend Conversion

**Input**: Design documents from `/specs/001-react-frontend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `frontend/tests/` at repository root
- Paths shown below follow the plan.md structure with `frontend/` prefix

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend directory structure per implementation plan (frontend/src/components/, frontend/src/pages/, frontend/src/styles/, frontend/src/hooks/, frontend/src/utils/, frontend/src/services/, frontend/src/store/, frontend/src/types/, frontend/src/config/, frontend/tests/)
- [x] T002 Initialize React 18.2+ project with Vite 5.0+ and TypeScript 5.0+ (npm create vite@latest frontend -- --template react-ts)
- [x] T003 [P] Install core dependencies (react-router-dom, tailwindcss, react-hook-form, zustand) via npm
- [x] T004 [P] Install development dependencies (eslint, prettier, @typescript-eslint, vitest, @testing-library/react, @playwright/test) via npm
- [x] T005 [P] Configure Tailwind CSS 3.4+ with custom colors (primary #F59E0B, secondary #3B82F6, success #10B981, warning #F59E0B, error #EF4444) in frontend/tailwind.config.js
- [x] T006 [P] Configure ESLint and Prettier in frontend/.eslintrc.js and frontend/.prettierrc
- [x] T007 [P] Configure TypeScript in frontend/tsconfig.json with strict mode enabled
- [x] T008 [P] Configure Vite in frontend/vite.config.ts with path aliases (@/ -> frontend/src/)
- [x] T009 Create environment configuration file frontend/.env with VITE_API_BASE_URL, VITE_ENABLE_MOCK_DATA, VITE_APP_NAME, VITE_APP_URL
- [x] T010 [P] Create global styles in frontend/src/styles/global.css with Tailwind directives and custom CSS variables
- [x] T011 Create TypeScript type definitions in frontend/src/types/index.ts for all entities (User, Product, Purchase, QRCode, etc.)
- [x] T012 [P] Create utility functions in frontend/src/utils/formatters.ts (date formatting, currency formatting, etc.)
- [x] T013 [P] Create utility functions in frontend/src/utils/validators.ts (email validation, password validation, etc.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T014 Create Zustand stores for state management in frontend/src/store/ (authStore.ts, productsStore.ts, purchasesStore.ts, uiStore.ts)
- [x] T015 [P] Implement authentication store (authStore.ts) with user data, token, isAuthenticated state, login/logout actions
- [x] T016 [P] Implement products store (productsStore.ts) with product list, selected product, filters state
- [x] T017 [P] Implement purchases store (purchasesStore.ts) with purchase history, current purchase state
- [x] T018 [P] Implement UI store (uiStore.ts) with sidebar state, modal state, loading states
- [x] T019 Create mock data in frontend/src/services/mock/mockData.ts (mockUsers, mockProducts, mockPurchases, mockTestimonials)
- [x] T020 [P] Create mock API service in frontend/src/services/mock/mockApi.ts with all CRUD operations (login, logout, getProducts, createProduct, etc.)
- [x] T021 Create API service interface in frontend/src/services/api.ts that switches between mock and real API based on VITE_ENABLE_MOCK_DATA
- [x] T022 Create common components in frontend/src/components/common/ (Button.tsx, Card.tsx, Modal.tsx, Input.tsx, Select.tsx, Badge.tsx, Alert.tsx, Spinner.tsx)
- [x] T023 [P] Create Button component in frontend/src/components/common/Button.tsx with variants (primary, secondary, tertiary) and sizes
- [x] T024 [P] Create Card component in frontend/src/components/common/Card.tsx with header, body, footer sections
- [x] T025 [P] Create Modal component in frontend/src/components/common/Modal.tsx with open/close state and accessibility
- [x] T026 [P] Create Input component in frontend/src/components/common/Input.tsx with validation states and accessibility
- [x] T027 [P] Create Alert component in frontend/src/components/common/Alert.tsx with variants (success, warning, error, info)
- [x] T028 [P] Create Spinner component in frontend/src/components/common/Spinner.tsx for loading states
- [x] T029 Create layout components in frontend/src/components/layout/ (Header.tsx, Sidebar.tsx, Footer.tsx, PageLayout.tsx)
- [x] T030 [P] Create Header component in frontend/src/components/layout/Header.tsx with navigation and user menu
- [x] T031 [P] Create Sidebar component in frontend/src/components/layout/Sidebar.tsx with navigation items and active state highlighting
- [x] T032 [P] Create PageLayout component in frontend/src/components/layout/PageLayout.tsx with header, sidebar, and content area
- [x] T033 Create React Router configuration in frontend/src/App.tsx with all routes (/, /auth/login, /auth/register, /seller/*, /buyer/*)
- [x] T034 Implement protected route wrapper in frontend/src/components/common/ProtectedRoute.tsx for authentication and role-based access
- [x] T035 Implement error boundary in frontend/src/components/common/ErrorBoundary.tsx for error handling
- [x] T036 Create custom hooks in frontend/src/hooks/ (useAuth.ts, useProducts.ts, usePurchases.ts, useMediaQuery.ts)
- [x] T037 [P] Create useAuth hook in frontend/src/hooks/useAuth.ts for authentication state and actions
- [x] T038 [P] Create useMediaQuery hook in frontend/src/hooks/useMediaQuery.ts for responsive breakpoints

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Landing Page Access (Priority: P1) 🎯 MVP

**Goal**: Provide a comprehensive landing page that clearly explains what the system offers through multiple sections, so visitors can understand if this platform is relevant to their needs.

**Independent Test**: Can be fully tested by accessing the root URL and verifying the landing page displays correctly with all sections (hero, features, how it works, testimonials, login CTA) visible and properly formatted, without requiring any authentication or user account.

### Implementation for User Story 1

- [x] T045 [P] [US1] Create landing page directory structure in frontend/src/pages/landing/
- [x] T046 [P] [US1] Create Hero component in frontend/src/pages/landing/Hero.tsx with system introduction and call-to-action buttons
- [x] T047 [P] [US1] Create Features component in frontend/src/pages/landing/Features.tsx highlighting key system capabilities
- [x] T048 [P] [US1] Create HowItWorks component in frontend/src/pages/landing/HowItWorks.tsx explaining the user journey
- [x] T049 [P] [US1] Create Testimonials component in frontend/src/pages/landing/Testimonials.tsx with user feedback from mock data
- [x] T050 [P] [US1] Create Footer component in frontend/src/components/layout/Footer.tsx with links and copyright
- [x] T051 [US1] Create LandingPage component in frontend/src/pages/landing/LandingPage.tsx that composes Hero, Features, HowItWorks, Testimonials, and Footer
- [x] T052 [US1] Add landing page route (/) in frontend/src/App.tsx
- [x] T053 [US1] Implement responsive design for landing page components (mobile-first approach with Tailwind breakpoints)
- [x] T054 [US1] Add navigation links from landing page to login page in Hero component
- [x] T055 [US1] Ensure all landing page content is visible and properly formatted with constitution color scheme

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Provide a login page where users can enter credentials to authenticate and access their dashboard based on their role (seller or buyer).

**Independent Test**: Can be fully tested by navigating to the login page, entering credentials, and verifying successful authentication redirects to the appropriate dashboard based on user type.

### Implementation for User Story 2

- [x] T061 [P] [US2] Create auth page directory structure in frontend/src/pages/auth/
- [x] T062 [P] [US2] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with email and password fields using React Hook Form
- [x] T063 [P] [US2] Create RegisterForm component in frontend/src/components/auth/RegisterForm.tsx with email, password, name, and role fields using React Hook Form
- [x] T064 [P] [US2] Implement form validation in LoginForm and RegisterForm using Zod schema (email format, password complexity, required fields)
- [x] T065 [P] [US2] Create auth service in frontend/src/services/authService.ts with login, register, logout, and getMe functions
- [x] T066 [P] [US2] Implement authentication API calls in frontend/src/services/api.ts (POST /auth/login, POST /auth/register, POST /auth/logout, GET /auth/me)
- [x] T067 [US2] Create LoginPage component in frontend/src/pages/auth/LoginPage.tsx with LoginForm and link to registration
- [x] T068 [US2] Create RegisterPage component in frontend/src/pages/auth/RegisterPage.tsx with RegisterForm and link to login
- [x] T069 [US2] Add authentication routes (/auth/login, /auth/register) in frontend/src/App.tsx
- [x] T070 [US2] Implement authentication logic in useAuth hook to handle login, logout, and token storage
- [x] T071 [US2] Implement protected route logic to redirect unauthenticated users to login page
- [x] T072 [US2] Implement role-based redirection after login (seller → /seller/dashboard, buyer → /buyer/qr-scanner)
- [x] T073 [US2] Add error handling for invalid credentials with appropriate error messages
- [x] T074 [US2] Add navigation links from login page back to landing page
- [x] T075 [US2] Ensure authentication pages are fully responsive (mobile-first approach)
- [x] T076 [US2] Store authentication token in localStorage with proper security considerations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Seller Dashboard with Sidebar Navigation (Priority: P2)

**Goal**: Provide sellers with a dashboard where they can navigate through multiple pages using a sidebar to manage products, view sales, generate QR codes, analyze performance, and configure settings.

**Independent Test**: Can be fully tested by logging in as a seller and navigating through multiple pages via the sidebar, verifying each page loads correctly and navigation works smoothly.

### Implementation for User Story 3

- [x] T082 [P] [US3] Create seller page directory structure in frontend/src/pages/seller/ (dashboard/, products/, sales/, qr-codes/, analytics/, settings/)
- [x] T083 [P] [US3] Create SellerSidebar component in frontend/src/components/seller/SellerSidebar.tsx with navigation items (Dashboard, Products, Sales, QR Codes, Analytics, Settings)
- [x] T084 [P] [US3] Implement active state highlighting in SellerSidebar for current page
- [x] T085 [P] [US3] Create SellerLayout component in frontend/src/components/seller/SellerLayout.tsx with SellerSidebar and PageLayout
- [x] T086 [P] [US3] Create ProductCard component in frontend/src/components/seller/ProductCard.tsx with product image, name, price, and actions
- [x] T087 [P] [US3] Create ProductForm component in frontend/src/components/seller/ProductForm.tsx for creating/editing products
- [x] T088 [P] [US3] Create SalesChart component in frontend/src/components/seller/SalesChart.tsx for visual analytics
- [x] T089 [P] [US3] Create QRCodeDisplay component in frontend/src/components/seller/QRCodeDisplay.tsx for showing QR codes
- [x] T090 [P] [US3] Create SellerDashboard page in frontend/src/pages/seller/dashboard/SellerDashboard.tsx with overview statistics and recent activity
- [x] T091 [P] [US3] Create Products page in frontend/src/pages/seller/products/ProductsPage.tsx with product list, filters, and create/edit functionality
- [x] T092 [P] [US3] Create Sales page in frontend/src/pages/seller/sales/SalesPage.tsx with sales history and details
- [x] T093 [P] [US3] Create QRCodes page in frontend/src/pages/seller/qr-codes/QRCodesPage.tsx with QR code generation and management
- [x] T094 [P] [US3] Create Analytics page in frontend/src/pages/seller/analytics/AnalyticsPage.tsx with performance metrics and charts
- [x] T095 [P] [US3] Create Settings page in frontend/src/pages/seller/settings/SettingsPage.tsx with profile and account settings
- [x] T096 [US3] Add seller dashboard routes in frontend/src/App.tsx (/seller/dashboard, /seller/products, /seller/sales, /seller/qr-codes, /seller/analytics, /seller/settings)
- [x] T097 [US3] Implement product CRUD operations in products store (create, read, update, delete)
- [x] T098 [US3] Implement product API calls in frontend/src/services/api.ts (GET /products, POST /products, PUT /products/:id, DELETE /products/:id)
- [x] T099 [US3] Implement sales data fetching in frontend/src/services/api.ts (GET /purchases for seller's sales)
- [x] T100 [US3] Implement analytics data fetching in frontend/src/services/api.ts (GET /analytics/seller)
- [x] T101 [US3] Implement QR code generation in frontend/src/services/api.ts (GET /qr-codes/:productId)
- [x] T102 [US3] Add role-based access control to prevent buyers from accessing seller dashboard
- [x] T103 [US3] Implement logout functionality in seller dashboard
- [x] T104 [US3] Ensure all seller dashboard pages are fully responsive (mobile sidebar transforms to drawer)
- [x] T105 [US3] Add loading states and error handling for all seller dashboard operations
- [x] T106 [US3] Implement product image upload functionality (mock initially, real upload later)
- [x] T107 [US3] Add product validation (name, description, price, category, condition)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Buyer Dashboard with Sidebar Navigation (Priority: P2)

**Goal**: Provide buyers with a dashboard where they can navigate through multiple pages using a sidebar to scan QR codes, view purchases, manage profile, and access transaction history.

**Independent Test**: Can be fully tested by logging in as a buyer and navigating through multiple pages via the sidebar, verifying each page loads correctly and navigation works smoothly.

### Implementation for User Story 4

- [x] T114 [P] [US4] Create buyer page directory structure in frontend/src/pages/buyer/ (qr-scanner/, purchases/, profile/, history/)
- [x] T115 [P] [US4] Create BuyerSidebar component in frontend/src/components/buyer/BuyerSidebar.tsx with navigation items (QR Scanner, My Purchases, Profile Settings, History)
- [x] T116 [P] [US4] Implement active state highlighting in BuyerSidebar for current page
- [x] T117 [P] [US4] Create BuyerLayout component in frontend/src/components/buyer/BuyerLayout.tsx with BuyerSidebar and PageLayout
- [x] T118 [P] [US4] Install and configure QR code scanning library (react-qr-reader or html5-qrcode) via npm
- [x] T119 [P] [US4] Create QRScanner component in frontend/src/components/buyer/QRScanner.tsx with camera access and QR code detection
- [x] T120 [P] [US4] Create PurchaseCard component in frontend/src/components/buyer/PurchaseCard.tsx with purchase details and status
- [x] T121 [P] [US4] Create ProfileForm component in frontend/src/components/buyer/ProfileForm.tsx for profile settings
- [x] T122 [P] [US4] Create BuyerDashboard page in frontend/src/pages/buyer/qr-scanner/BuyerDashboard.tsx as default landing page for buyers
- [x] T123 [P] [US4] Create QRScanner page in frontend/src/pages/buyer/qr-scanner/QRScannerPage.tsx with camera-based QR code scanning
- [x] T124 [P] [US4] Create Purchases page in frontend/src/pages/buyer/purchases/PurchasesPage.tsx with purchase history
- [x] T125 [P] [US4] Create Profile page in frontend/src/pages/buyer/profile/ProfilePage.tsx with profile settings
- [x] T126 [P] [US4] Create History page in frontend/src/pages/buyer/history/HistoryPage.tsx with transaction history
- [x] T127 [US4] Add buyer dashboard routes in frontend/src/App.tsx (/buyer/qr-scanner, /buyer/purchases, /buyer/profile, /buyer/history)
- [x] T128 [US4] Implement QR code scanning API call in frontend/src/services/api.ts (POST /qr-codes/scan)
- [x] T129 [US4] Implement purchase creation in frontend/src/services/api.ts (POST /purchases)
- [x] T130 [US4] Implement purchase history fetching in frontend/src/services/api.ts (GET /purchases)
- [x] T131 [US4] Implement profile update in frontend/src/services/api.ts (PUT /users/:id)
- [x] T132 [US4] Add role-based access control to prevent sellers from accessing buyer dashboard
- [x] T133 [US4] Implement logout functionality in buyer dashboard
- [x] T134 [US4] Ensure all buyer dashboard pages are fully responsive (mobile sidebar transforms to drawer)
- [x] T135 [US4] Add loading states and error handling for all buyer dashboard operations
- [x] T136 [US4] Implement camera permission handling and error messages for QR scanner
- [x] T137 [US4] Add product display after successful QR code scan
- [x] T138 [US4] Implement purchase confirmation flow after QR code scan
- [x] T139 [US4] Add purchase status tracking (pending, completed, cancelled, refunded)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T147 [P] Implement form auto-save for profile settings and product forms
- [ ] T148 [P] Add keyboard shortcuts for common actions (e.g., Ctrl+K for search)
- [ ] T149 [P] Implement offline support with service workers (optional enhancement)
- [ ] T150 [P] Add analytics tracking (Google Analytics or similar) for user behavior
- [ ] T151 [P] Implement error logging and monitoring (Sentry or similar)
- [x] T152 [P] Optimize bundle size with code splitting and lazy loading for all routes
- [x] T153 [P] Add meta tags and Open Graph tags for SEO
- [x] T154 [P] Implement favicon and app icons for different devices
- [x] T155 [P] Add 404 page for non-existent routes
- [x] T156 [P] Add 500 error page for server errors
- [x] T157 [P] Implement session timeout and auto-logout
- [ ] T158 [P] Add password reset functionality (requires backend endpoint)
- [ ] T159 [P] Implement email verification flow (requires backend endpoint)
- [ ] T160 [P] Add user avatar upload functionality (requires backend endpoint)
- [x] T161 [P] Implement product image upload with preview
- [x] T162 [P] Add export functionality for purchase history (CSV, PDF)
- [x] T163 [P] Implement print styles for QR codes and purchase receipts
- [x] T164 [P] Add help/documentation section with user guides
- [x] T165 [P] Implement contact/support form for user feedback
- [x] T166 [P] Add about page with company information
- [x] T167 [P] Implement terms of service and privacy policy pages
- [ ] T168 [P] Add social media sharing for products
- [ ] T169 [P] Implement bookmark/favorite products functionality (requires backend endpoint)
- [ ] T170 [P] Add product comparison feature
- [ ] T171 [P] Implement advanced filters for products (price range, category, condition)
- [ ] T172 [P] Add product recommendations based on purchase history
- [ ] T173 [P] Implement notifications for new purchases and sales
- [ ] T174 [P] Add real-time updates for purchase status (requires WebSocket or polling)
- [ ] T175 [P] Implement multi-language support (i18n)
- [ ] T176 [P] Add currency conversion for international users
- [ ] T177 [P] Implement PWA features (installable app, offline mode)
- [ ] T178 [P] Add performance monitoring and optimization
- [ ] T179 [P] Run Lighthouse audit and fix all performance issues
- [ ] T180 [P] Run accessibility audit and fix all issues
- [ ] T181 [P] Run security audit and fix all vulnerabilities
- [ ] T182 [P] Update documentation in frontend/README.md with setup and deployment instructions
- [ ] T183 [P] Update quickstart.md validation with actual implementation
- [ ] T184 Code cleanup and refactoring across all components
- [ ] T186 Security hardening (CSP headers, XSS prevention, etc.)
- [ ] T187 Final testing and bug fixes
- [ ] T188 Prepare for production deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Components before pages
- Services before API integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create Hero component in frontend/src/pages/landing/Hero.tsx"
Task: "Create Features component in frontend/src/pages/landing/Features.tsx"
Task: "Create HowItWorks component in frontend/src/pages/landing/HowItWorks.tsx"
Task: "Create Testimonials component in frontend/src/pages/landing/Testimonials.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T038) - CRITICAL
3. Complete Phase 3: User Story 1 (T039-T055)
4. Complete Phase 4: User Story 2 (T056-T076)
5. **STOP and VALIDATE**: Test User Stories 1 & 2 independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Landing Page)
   - Developer B: User Story 2 (Authentication)
   - Developer C: User Story 3 (Seller Dashboard)
   - Developer D: User Story 4 (Buyer Dashboard)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All paths are relative to repository root with `frontend/` prefix
- Mock data is used initially; real API integration happens later
- Responsive design is NON-NEGOTIABLE - must be implemented for all components
- Accessibility (WCAG AA) is required for all components
- Constitution color scheme must be used throughout the application

---

## Task Count Summary

- **Phase 1 (Setup)**: 13 tasks (T001-T013)
- **Phase 2 (Foundational)**: 25 tasks (T014-T038)
- **Phase 3 (User Story 1)**: 11 tasks (T045-T055)
- **Phase 4 (User Story 2)**: 16 tasks (T061-T076)
- **Phase 5 (User Story 3)**: 26 tasks (T082-T107)
- **Phase 6 (User Story 4)**: 26 tasks (T114-T139)
- **Phase 7 (Polish)**: 49 tasks (T140-T188)

**Total**: 166 tasks

---

## Estimated Timeline

- **Setup**: 1-2 days
- **Foundational**: 3-5 days
- **User Story 1 (Landing Page)**: 2-3 days
- **User Story 2 (Authentication)**: 3-4 days
- **User Story 3 (Seller Dashboard)**: 5-7 days
- **User Story 4 (Buyer Dashboard)**: 5-7 days
- **Polish**: 3-5 days

**Total**: 22-33 days (approximately 4-7 weeks) for a single developer

**With parallel development (2-4 developers)**: 10-18 days (approximately 2-4 weeks)
