# Quickstart Guide: React Frontend Conversion

**Feature**: 001-react-frontend  
**Date**: 2026-01-15  
**Status**: Complete

## Overview

This guide provides step-by-step instructions for setting up and running the React frontend application for the CoisasDeGaragem garage sale marketplace system.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher (recommended: v20.x LTS)
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Latest version (recommended)
- **VS Code Extensions**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

### Verify Installation

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
git --version   # Should show git version
```

---

## Project Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd CoisasDeGaragem

# Switch to the feature branch
git checkout 001-react-frontend
```

### Step 2: Install Dependencies

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

This will install all the required packages including:
- React 18.2+
- React Router DOM 6.20+
- Tailwind CSS 3.4+
- React Hook Form 7.48+
- Zustand 4.4+
- Vite 5.0+
- TypeScript 5.0+
- Vitest
- Playwright

### Step 3: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Feature Flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_ANALYTICS=false

# Application Settings
VITE_APP_NAME=CoisasDeGaragem
VITE_APP_URL=http://localhost:5173
```

---

## Development Workflow

### Start the Development Server

```bash
# From the frontend directory
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create an optimized production build
npm run build

# Preview the production build
npm run preview
```

### Run Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Lint and Format Code

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Format and lint
npm run check
```

---

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── index.html
│   └── assets/            # Images, fonts, etc.
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Reusable components
│   │   ├── layout/        # Layout components
│   │   ├── auth/          # Authentication components
│   │   ├── seller/        # Seller components
│   │   └── buyer/         # Buyer components
│   ├── pages/             # Page components
│   │   ├── landing/       # Landing page
│   │   ├── auth/          # Authentication pages
│   │   ├── seller/        # Seller dashboard pages
│   │   └── buyer/         # Buyer dashboard pages
│   ├── styles/            # Global styles
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── services/          # API services
│   ├── store/             # State management
│   ├── types/             # TypeScript types
│   ├── config/            # Configuration files
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── tests/                 # Test files
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Key Features and Pages

### Public Pages

1. **Landing Page** (`/`)
   - Hero section
   - Features section
   - How it works section
   - Testimonials section
   - Login CTA

2. **Login Page** (`/auth/login`)
   - Email and password form
   - Validation and error handling
   - Link to registration

3. **Registration Page** (`/auth/register`)
   - User registration form
   - Role selection (seller/buyer)
   - Validation and error handling

### Seller Dashboard Pages

1. **Dashboard** (`/seller/dashboard`)
   - Overview statistics
   - Recent activity
   - Quick actions

2. **Products** (`/seller/products`)
   - Product list with filters
   - Create/Edit/Delete products
   - QR code generation

3. **Sales** (`/seller/sales`)
   - Sales history
   - Sales analytics
   - Transaction details

4. **QR Codes** (`/seller/qr-codes`)
   - QR code management
   - QR code printing
   - Scan statistics

5. **Analytics** (`/seller/analytics`)
   - Performance metrics
   - Charts and graphs
   - Date range filters

6. **Settings** (`/seller/settings`)
   - Profile settings
   - Account settings
   - Notification preferences

### Buyer Dashboard Pages

1. **QR Scanner** (`/buyer/qr-scanner`)
   - Camera-based QR code scanning
   - Product display
   - Purchase confirmation

2. **My Purchases** (`/buyer/purchases`)
   - Purchase history
   - Purchase details
   - Status tracking

3. **Profile Settings** (`/buyer/profile`)
   - Profile information
   - Avatar upload
   - Contact information

4. **History** (`/buyer/history`)
   - Transaction history
   - Search and filter
   - Export options

---

## Authentication Flow

### Login Flow

1. User navigates to `/auth/login`
2. Enters email and password
3. System validates credentials
4. On success:
   - Stores authentication token
   - Stores user data
   - Redirects to appropriate dashboard:
     - Seller → `/seller/dashboard`
     - Buyer → `/buyer/qr-scanner`
5. On failure:
   - Displays error message
   - Stays on login page

### Protected Routes

All dashboard routes are protected:
- `/seller/*` - Requires seller role
- `/buyer/*` - Requires buyer role

Unauthenticated users attempting to access protected routes are redirected to `/auth/login`

### Logout Flow

1. User clicks logout button
2. System clears authentication token
3. System clears user data
4. Redirects to landing page (`/`)

---

## Mock Data Usage

The application uses mock data for initial development. Mock data is located in:

```
frontend/src/services/mock/
├── mockData.ts      # Mock data definitions
├── mockApi.ts       # Mock API implementation
└── index.ts         # Mock service exports
```

### Switching to Real API

To switch from mock data to real API:

1. Update `.env` file:
   ```bash
   VITE_ENABLE_MOCK_DATA=false
   VITE_API_BASE_URL=https://api.coisasdegaragem.com/api/v1
   ```

2. Update service imports in components:
   ```typescript
   // Change from:
   import { mockApi } from '@/services/mock';
   
   // To:
   import { api } from '@/services/api';
   ```

---

## Responsive Design

The application is fully responsive and follows mobile-first design principles:

### Breakpoints

- **Mobile**: < 768px (default styles)
- **Tablet**: 768px - 1024px (md: prefix)
- **Desktop**: > 1024px (lg: prefix)

### Testing Responsiveness

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select different device presets or custom dimensions
4. Test all pages and components

### Key Responsive Features

- Hamburger menu on mobile, full navigation on desktop
- Sidebar transforms to drawer on mobile
- Cards stack vertically on mobile, grid on desktop
- Touch targets minimum 44x44 pixels
- Readable text without zooming on mobile

---

## Color Scheme

The application uses the following color palette (defined in constitution):

```css
/* Primary Colors */
--color-primary: #F59E0B;      /* Amber-500 */
--color-primary-hover: #D97706; /* Amber-600 */
--color-primary-light: #FCD34D; /* Amber-300 */

/* Secondary Colors */
--color-secondary: #3B82F6;    /* Blue-500 */
--color-secondary-hover: #2563EB; /* Blue-600 */
--color-secondary-light: #60A5FA; /* Blue-400 */

/* Neutral Colors */
--color-background: #F9FAFB;   /* Gray-50 */
--color-surface: #FFFFFF;      /* White */
--color-text: #111827;         /* Gray-900 */
--color-text-secondary: #6B7280; /* Gray-500 */

/* Status Colors */
--color-success: #10B981;      /* Green-500 */
--color-warning: #F59E0B;      /* Amber-500 */
--color-error: #EF4444;        /* Red-500 */
```

### Using Colors in Tailwind

```html
<!-- Primary color -->
<button class="bg-amber-500 hover:bg-amber-600 text-white">
  Primary Button
</button>

<!-- Secondary color -->
<button class="bg-blue-500 hover:bg-blue-600 text-white">
  Secondary Button
</button>

<!-- Status colors -->
<div class="text-green-500">Success message</div>
<div class="text-amber-500">Warning message</div>
<div class="text-red-500">Error message</div>
```

---

## Common Tasks

### Add a New Page

1. Create page component in `src/pages/[module]/[page]/`
2. Add route in `src/App.tsx`
3. Add navigation item in sidebar (if applicable)

Example:

```typescript
// src/pages/seller/new-page/NewPage.tsx
import { PageLayout } from '@/components/layout/PageLayout';

export function NewPage() {
  return (
    <PageLayout title="New Page">
      <div>Your content here</div>
    </PageLayout>
  );
}

// src/App.tsx
import { NewPage } from '@/pages/seller/new-page/NewPage';

// Add route
<Route path="/seller/new-page" element={<NewPage />} />
```

### Add a New Component

1. Create component in `src/components/[category]/[ComponentName].tsx`
2. Export component
3. Import and use in pages or other components

Example:

```typescript
// src/components/common/CustomButton.tsx
interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function CustomButton({ children, onClick, variant = 'primary' }: CustomButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-amber-500 hover:bg-amber-600 text-white'
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <button className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### Add a New API Service

1. Create service function in `src/services/api.ts`
2. Add TypeScript types in `src/types/`
3. Use service in components

Example:

```typescript
// src/services/api.ts
export async function getProducts(filters?: ProductFilters) {
  const response = await fetch(`${API_BASE_URL}/products${buildQueryString(filters)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

// src/types/index.ts
export interface ProductFilters {
  sellerId?: string;
  category?: string;
  isAvailable?: boolean;
}
```

### Add State Management

1. Create store in `src/store/[storeName].ts`
2. Use store in components

Example:

```typescript
// src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));

// Usage in component
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, logout } = useAuthStore();
  // ...
}
```

---

## Testing

### Unit Tests

Unit tests are located in `tests/unit/` and use Vitest.

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests are located in `tests/integration/` and test component interactions.

### E2E Tests

E2E tests are located in `tests/e2e/` and use Playwright.

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/seller/dashboard');
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Port 5173 is already in use

**Solution**: Change the port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

**Issue**: Tailwind classes not working

**Solution**: Ensure `tailwind.config.js` is properly configured and `src/styles/global.css` includes Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Issue**: TypeScript errors

**Solution**: Ensure `tsconfig.json` is properly configured and all dependencies are installed:
```bash
npm install
npm run check
```

**Issue**: Mock data not loading

**Solution**: Check that `VITE_ENABLE_MOCK_DATA=true` in `.env` file and restart the dev server.

---

## Performance Optimization

The application is optimized for performance with the following measures:

1. **Code Splitting**: Route-based code splitting with React.lazy()
2. **Lazy Loading**: Images and components are lazy loaded
3. **Tree Shaking**: Unused code is removed during build
4. **Minification**: CSS and JavaScript are minified in production
5. **Image Optimization**: Images are optimized and served in WebP format
6. **Caching**: Static assets are cached for better performance

### Performance Targets

- First Contentful Paint (FCP): < 1.8 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Time to Interactive (TTI): < 3.8 seconds
- Cumulative Layout Shift (CLS): < 0.1

### Measuring Performance

```bash
# Build the application
npm run build

# Analyze bundle size
npm run build:analyze

# Run Lighthouse audit
npm run lighthouse
```

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy

### Deploy to Netlify

1. Push code to GitHub
2. Import project in Netlify
3. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add environment variables
5. Deploy

### Environment Variables for Production

```bash
VITE_API_BASE_URL=https://api.coisasdegaragem.com/api/v1
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_ANALYTICS=true
VITE_APP_NAME=CoisasDeGaragem
VITE_APP_URL=https://coisasdegaragem.com
```

---

## Next Steps

1. **Review the Data Model**: Understand the data structures used in the application
2. **Review the API Contract**: Understand the API endpoints and their contracts
3. **Review the Research Document**: Understand the technology choices and best practices
4. **Start Development**: Begin implementing the features according to the implementation tasks

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the project documentation in `specs/001-react-frontend/`
3. Check the constitution in `.specify/memory/constitution.md`
4. Contact the development team

---

**Happy Coding! 🚀**
