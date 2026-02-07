# EMR Frontend

## Tech Stack
- TypeScript, React 18, Vite
- TailwindCSS, React Query, React Router

## Directory Structure
```
src/
├── api/              # API client & React Query hooks
│   ├── client.ts     # Axios instance with JWT interceptor
│   ├── auth.ts       # Auth API hooks
│   ├── hospitals.ts  # Hospital API hooks
│   ├── users.ts      # User API hooks
│   └── patients.ts   # Patient API hooks
├── components/       # Reusable components
│   ├── ui/           # Base UI components (Button, Input, Modal, etc.)
│   └── layout/       # Layout components (Sidebar, Header, etc.)
├── features/         # Feature modules
│   ├── auth/         # Login, auth context
│   ├── dashboard/    # Main dashboard
│   ├── hospitals/    # Hospital settings
│   ├── users/        # User management
│   └── patients/     # Patient CRUD
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Root component with routing
├── main.tsx          # Entry point
└── index.css         # Global styles & Tailwind
```

## Conventions

### API Hooks
- Use React Query for all server state
- Custom hooks in `api/*.ts` files
- Pattern: `useQuery` for GET, `useMutation` for POST/PUT/DELETE

```typescript
// Example
export function usePatients() {
  return useQuery({ queryKey: ['patients'], queryFn: fetchPatients });
}

export function useCreatePatient() {
  return useMutation({ mutationFn: createPatient });
}
```

### Components
- Functional components with TypeScript
- Props interface defined above component
- Use `cn()` utility for conditional classNames

### Types
- Define API response types in `types/`
- Use `z.infer` with Zod for form validation types

### Authentication
- JWT stored in localStorage
- Axios interceptor adds `Authorization: Bearer <token>`
- `AuthContext` provides user state globally

### Routing
- Protected routes wrapped in `RequireAuth`
- Role-based route guards

## Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## UI Library
- **shadcn/ui** - Accessible, customizable components built on Radix UI
- Install components as needed: `npx shadcn-ui@latest add button`
- Components are copied to `src/components/ui/`

## Branding & Design System

### Colors (Medical Professional Theme)
```css
/* Primary - Teal/Cyan (trust, healthcare) */
--primary: 183 74% 44%;        /* #1A9BA1 */
--primary-foreground: 0 0% 100%;

/* Accent - Warm coral (friendly, approachable) */
--accent: 12 76% 61%;          /* #E07B54 */

/* Neutral grays */
--background: 0 0% 100%;
--foreground: 222 47% 11%;     /* slate-900 */
--muted: 210 40% 96%;          /* slate-100 */
--border: 214 32% 91%;         /* slate-200 */
```

### Typography
- **Font Family**: `Inter` (clean, modern, medical-grade readability)
- **Headings**: Semi-bold (600), tracking tight
- **Body**: Regular (400), 16px base

### Design Principles
1. **Clean & Minimal** - Reduce visual noise, prioritize content
2. **Accessible** - WCAG 2.1 AA contrast, keyboard navigation
3. **Professional** - Muted colors, generous whitespace
4. **Consistent** - Use shadcn/ui components for uniformity

### Logo & Brand Assets
- Logo files stored in `public/`
- App name: **EMR** (Electronic Medical Records)
- Favicon: Simple teal medical cross icon

## Styling
- TailwindCSS for utility-first styling
- shadcn/ui components for consistency
- Custom design tokens in `tailwind.config.js`
- Dark mode support planned for future

## Environment Variables
- `VITE_API_URL` - Backend API base URL
