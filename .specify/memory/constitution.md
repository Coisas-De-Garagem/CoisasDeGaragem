<!--
Sync Impact Report:
- Version change: None → 1.0.0 (initial ratification)
- Modified principles: N/A (new constitution)
- Added sections: All sections (new constitution)
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md - Reviewed, no changes needed
  ✅ spec-template.md - Reviewed, no changes needed
  ✅ tasks-template.md - Reviewed, no changes needed
- Follow-up TODOs: None
-->

# CoisasDeGaragem Constitution

## Core Principles

### I. File Organization & Structure

All code MUST follow a consistent, hierarchical file organization pattern that promotes maintainability and scalability.

**CSS Files MUST be organized as**: `styles/nome-da-pagina/arquivo.css`
- Each page or component MUST have its own dedicated folder under `styles/`
- CSS files MUST be named descriptively based on their purpose
- Global styles MUST reside in `styles/global/` or `styles/common/`

**Routing MUST follow the pattern**: `/modulo/nome-da-pagina`
- Routes MUST be organized by functional modules (e.g., `/auth/login`, `/marketplace/listings`, `/user/profile`)
- Route names MUST be lowercase with hyphens separating words
- Module prefixes MUST reflect the major functional area of the application
- Nested routes MUST follow the same pattern (e.g., `/marketplace/listings/123`)

**JavaScript/TypeScript files MUST follow the same organizational principles**:
- Component-specific logic MUST reside in `js/nome-da-pagina/` or `src/components/nome-da-pagina/`
- Shared utilities MUST be in `js/utils/` or `src/utils/`
- Service/API calls MUST be in `js/services/` or `src/services/`

**Rationale**: Consistent file organization reduces cognitive load, enables faster onboarding of new developers, and makes the codebase easier to navigate and maintain. The hierarchical structure ensures that related files are grouped together logically.

### II. Responsive Design (NON-NEGOTIABLE)

All user interfaces MUST be designed and implemented to work seamlessly on both mobile devices and desktop computers.

**Mobile-First Approach MUST be used**:
- Design MUST start with mobile viewport (320px minimum width)
- Progressive enhancement MUST be applied for larger screens
- Touch targets MUST be at least 44x44 pixels for mobile usability
- Text MUST be readable without zooming on mobile devices

**Breakpoints MUST be defined consistently**:
- Mobile: < 768px (default)
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Additional breakpoints MAY be added as needed with clear justification

**Layout MUST adapt fluidly**:
- Grid and flexbox layouts MUST be used for responsive behavior
- Images MUST scale appropriately using `max-width: 100%` and `object-fit`
- Navigation MUST transform appropriately for mobile (e.g., hamburger menu)
- Forms MUST be fully functional on touch devices

**Rationale**: A significant portion of marketplace users access platforms via mobile devices. Failing to provide a responsive experience alienates a large user base and reduces engagement. Mobile-first design ensures the most constrained experience is optimized first.

### III. Modern UI/UX Design

All interfaces MUST maintain a modern, aesthetically pleasing design with a strong focus on user experience and usability.

**Design Principles MUST be followed**:
- Clean, uncluttered interfaces with adequate white space
- Clear visual hierarchy using size, color, and contrast
- Consistent spacing (8px grid system recommended)
- Smooth transitions and micro-interactions for feedback
- Intuitive navigation patterns

**Accessibility MUST be prioritized**:
- Color contrast MUST meet WCAG AA standards (minimum 4.5:1 for text)
- All interactive elements MUST be keyboard accessible
- Screen reader compatibility MUST be maintained
- Focus indicators MUST be visible and clear
- Alt text MUST be provided for all meaningful images

**Performance MUST be optimized**:
- Load times MUST be under 3 seconds on 3G connections
- Images MUST be optimized (WebP format preferred, lazy loading)
- CSS and JavaScript MUST be minified in production
- Critical rendering path MUST be optimized

**Rationale**: Modern design builds user trust, increases engagement, and reduces bounce rates. Good UX directly impacts conversion rates and user satisfaction in a marketplace context where users need to quickly find and evaluate items.

### IV. Color Scheme & Branding

The system MUST use a pleasant, cohesive color palette appropriate for a garage sale marketplace environment.

**Primary Color Palette MUST include**:
- A warm, inviting primary color (e.g., orange or amber) that evokes the feeling of garage sales and community
- A complementary secondary color for accents and CTAs
- Neutral grays for backgrounds, borders, and text
- Success/warning/error colors for feedback states

**Color Usage Guidelines**:
- Primary color MUST be used for main actions and branding elements
- Secondary color MUST highlight important information and CTAs
- Colors MUST maintain sufficient contrast for accessibility
- Dark mode support MUST be considered with appropriate color adjustments

**Suggested Palette (subject to refinement)**:
- Primary: #F59E0B (Amber-500) - warm, energetic, approachable
- Secondary: #3B82F6 (Blue-500) - trustworthy, professional
- Background: #F9FAFB (Gray-50) - clean, neutral
- Text: #111827 (Gray-900) - high contrast, readable
- Success: #10B981 (Green-500)
- Warning: #F59E0B (Amber-500)
- Error: #EF4444 (Red-500)

**Rationale**: Color psychology plays a crucial role in user perception. Warm colors create a welcoming atmosphere appropriate for community-driven marketplaces, while professional blues maintain trust. Consistent color usage reinforces brand identity and improves usability.

## Technical Standards

### Development Stack Requirements

**Frontend Technologies MUST include**:
- Modern CSS framework or utility classes (e.g., Tailwind CSS, Bootstrap 5)
- JavaScript ES6+ or TypeScript for interactivity
- Responsive design framework (CSS Grid, Flexbox, or framework-provided system)
- Build tools for optimization (minification, bundling)

**Code Quality Standards**:
- Code MUST follow consistent formatting (Prettier or similar)
- Linting MUST be configured and enforced
- Comments MUST explain complex logic, not obvious code
- Variable and function names MUST be descriptive and follow naming conventions

### File Naming Conventions

**HTML Files**: lowercase with hyphens (e.g., `marketplace-listings.html`)
**CSS Files**: lowercase with hyphens (e.g., `marketplace-listings.css`)
**JavaScript Files**: camelCase (e.g., `marketplaceListings.js`) or kebab-case based on project convention
**Folders**: lowercase with hyphens (e.g., `marketplace-listings/`)

### Performance Standards

- First Contentful Paint (FCP) MUST be under 1.8 seconds
- Largest Contentful Paint (LCP) MUST be under 2.5 seconds
- Time to Interactive (TTI) MUST be under 3.8 seconds
- Cumulative Layout Shift (CLS) MUST be under 0.1

## Design System Requirements

### Component Library

**Reusable Components MUST be created for**:
- Buttons (primary, secondary, tertiary, sizes, states)
- Forms (inputs, labels, validation states)
- Cards (product cards, user cards, etc.)
- Navigation (header, footer, breadcrumbs)
- Modals and dialogs
- Loading states and skeletons
- Alerts and notifications

**Components MUST be**:
- Documented with usage examples
- Accessible by default
- Responsive by default
- Consistent with the overall design system

### Typography

**Font Stack MUST be**:
- System fonts preferred for performance (San Francisco, Segoe UI, Roboto)
- Or a web font loaded efficiently (Google Fonts with display=swap)
- Consistent font weights defined (e.g., 400, 500, 600, 700)
- Line height of 1.5 for body text, 1.2 for headings

**Heading Hierarchy MUST be clear**:
- H1: Page titles (used once per page)
- H2: Section titles
- H3: Subsection titles
- H4-H6: Additional hierarchy as needed

## Governance

### Amendment Procedure

**Constitution amendments MUST follow this process**:
1. Proposed changes MUST be documented with rationale
2. Impact assessment MUST be completed for all dependent templates and code
3. Changes MUST be reviewed and approved by project maintainers
4. Version MUST be incremented according to semantic versioning
5. All dependent artifacts MUST be updated to maintain consistency
6. Migration plan MUST be documented for breaking changes

### Versioning Policy

**Semantic Versioning MUST be followed**:
- **MAJOR** (X.0.0): Backward incompatible changes, principle removals, or redefinitions that require code changes
- **MINOR** (0.X.0): New principles or sections added, material guidance expansions that don't break existing implementations
- **PATCH** (0.0.X): Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

**All pull requests and code reviews MUST verify**:
- File organization follows the defined patterns
- Routes follow the `/modulo/nome-da-pagina` pattern
- CSS is properly organized in `styles/nome-da-pagina/` folders
- Design is responsive and works on mobile and desktop
- Color usage aligns with the defined palette
- Accessibility standards are met
- Performance benchmarks are maintained

**Complexity MUST be justified**:
- Any deviation from these principles MUST be documented with clear rationale
- Technical debt MUST be tracked with planned remediation
- Trade-offs MUST be explicitly acknowledged in design documents

### Runtime Guidance

**For day-to-day development, reference**:
- This constitution for high-level principles and requirements
- Project-specific style guides for implementation details
- Component documentation for reusable UI elements
- Design system documentation for visual standards

**Version**: 1.0.0 | **Ratified**: 2026-01-15 | **Last Amended**: 2026-01-15
