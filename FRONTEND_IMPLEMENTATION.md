# Frontend Implementation Guide

This document outlines the remaining frontend components and pages to be created.

## UI Components (shadcn/ui style)

All components should be created in `src/components/ui/` directory. Use the pattern established in button.tsx, card.tsx, and input.tsx.

### Required UI Components:
1. ✅ **button.tsx** - Button component with variants
2. ✅ **card.tsx** - Card container component
3. ✅ **input.tsx** - Input field component
4. ✅ **toast.tsx** & **toaster.tsx** - Toast notifications
5. ⬜ **dialog.tsx** - Modal dialog component
6. ⬜ **label.tsx** - Form label component
7. ⬜ **select.tsx** - Select dropdown component
8. ⬜ **tabs.tsx** - Tabs component for ProjectDetailPage
9. ⬜ **table.tsx** - Table component for lists
10. ⬜ **badge.tsx** - Status badges (healthy/unhealthy/pending)
11. ⬜ **alert-dialog.tsx** - Confirmation dialogs
12. ⬜ **dropdown-menu.tsx** - Dropdown menus

## Pages

### ✅ LoginPage (`src/pages/LoginPage.tsx`)
- Email/password form
- Login submission
- Error handling
- Redirect on success

### ✅ DashboardPage (`src/pages/DashboardPage.tsx`)
- Overview stats (total projects, active health checks, recent notifications)
- Quick links to projects
- Recent activity feed

### ✅ ProjectsPage (`src/pages/ProjectsPage.tsx`)
- List all projects in table format
- Create new project button
- Edit/delete actions
- Search/filter functionality

### ⬜ ProjectDetailPage (`src/pages/ProjectDetailPage.tsx`)
Tabs-based layout with:
- **Overview tab**: Project info, API key display
- **Email Config tab**: SMTP settings, developer emails, template management
- **Notion Config tab**: Integration token, database ID, property mappings
- **Health Checks tab**: List of health checks, create/edit/delete
- **Portainer tab**: Stack linking, control buttons

## Feature Components

### Email Configuration (`src/components/Projects/`)
1. **EmailConfigForm.tsx**
   - SMTP host, port, secure toggle
   - Auth credentials (user/pass)
   - From email address
   - Test connection button

2. **DeveloperEmailsList.tsx**
   - List of developer emails
   - Add/remove functionality
   - Validation

3. **EmailTemplateEditor.tsx**
   - Subject, HTML body, text body fields
   - Variable hints ({{serviceName}}, {{error}}, etc.)
   - Preview button
   - Save/delete buttons

### Notion Configuration (`src/components/Projects/`)
1. **NotionConfigForm.tsx**
   - Enable/disable toggle
   - Integration token field
   - Database ID field
   - Test connection button

2. **NotionPropertyMapping.tsx**
   - Map Notion properties to notification fields
   - Title, description, priority, status mappings
   - Fetch available properties from Notion

### Health Checks (`src/components/Projects/`)
1. **HealthChecksTable.tsx**
   - List of health checks with status indicators
   - Last check timestamp
   - Run now button
   - Edit/delete actions

2. **HealthCheckForm.tsx**
   - Name, URL fields
   - Interval selection (1min, 5min, 15min, 30min, 1h, custom)
   - Timeout setting
   - Enable/disable toggle

3. **HealthCheckHistory.tsx**
   - Show recent check results
   - Success/failure timeline
   - Error messages

### Portainer Integration (`src/components/Projects/`)
1. **PortainerStacksList.tsx**
   - List stacks from Portainer API
   - Stack status, container count
   - Start/stop/restart buttons
   - Real-time polling

2. **PortainerConfigForm.tsx**
   - API URL field
   - API token field
   - Test connection button
   - Stack ID selection

## Layout Components

### ✅ DashboardLayout (`src/components/Layout/DashboardLayout.tsx`)
- Sidebar navigation
- Header with user menu
- Main content area (Outlet for routes)
- Responsive design

### Sidebar Navigation Items:
- Dashboard (/)
- Projects (/projects)
- Settings (future)
- Logout

## API Hooks (React Query)

Create custom hooks in `src/hooks/` for data fetching:

### Projects (`src/hooks/useProjects.ts`)
```typescript
export const useProjects = () => useQuery(['projects'], fetchProjects);
export const useProject = (id: string) => useQuery(['project', id], () => fetchProject(id));
export const useCreateProject = () => useMutation(createProject);
export const useUpdateProject = () => useMutation(updateProject);
export const useDeleteProject = () => useMutation(deleteProject);
```

### Health Checks (`src/hooks/useHealthChecks.ts`)
```typescript
export const useHealthChecks = (projectId: string) => 
  useQuery(['healthChecks', projectId], () => fetchHealthChecks(projectId));
export const useCreateHealthCheck = () => useMutation(createHealthCheck);
export const useRunHealthCheck = () => useMutation(runHealthCheck);
```

### Similar patterns for:
- Email Templates
- Portainer Stacks
- Notion Config

## Forms (React Hook Form + Zod)

All forms should use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  // field validations
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {},
});
```

## Styling Guidelines

- Use Tailwind CSS classes
- Follow shadcn/ui patterns
- Responsive design (mobile-first)
- Consistent spacing and colors
- Accessible components (ARIA labels)

## Icons

Use `lucide-react` for icons:
```typescript
import { Home, Settings, LogOut, Plus, Edit, Trash, Play, Pause, RotateCw } from 'lucide-react';
```

## State Management

- **Server State**: React Query (tanstack/react-query)
- **UI State**: React Context (AuthContext)
- **Form State**: React Hook Form

## Error Handling

- Display errors using Toast notifications
- Form validation errors inline
- API errors with user-friendly messages
- Retry functionality for failed requests

## Testing

Each component should have corresponding test files:
- `ComponentName.test.tsx` in same directory
- Test rendering, user interactions, API calls (mocked)
- Use React Testing Library

## Implementation Priority

1. ✅ Core setup (main.tsx, App.tsx, routing)
2. ✅ Authentication (LoginPage, AuthContext)
3. ✅ Layout (DashboardLayout with navigation)
4. ✅ Projects CRUD (ProjectsPage, basic project operations)
5. ⬜ Project Detail Page with tabs
6. ⬜ Email Configuration UI
7. ⬜ Notion Configuration UI
8. ⬜ Health Checks UI
9. ⬜ Portainer Integration UI
10. ⬜ Dashboard stats and charts
11. ⬜ Tests for all components

## Next Steps

Run the following to install additional shadcn/ui components as needed:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add dropdown-menu
```

Or manually create them following the pattern in the existing components.
