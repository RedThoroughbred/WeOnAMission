# React Migration Plan - Mission Trip Platform

## Executive Summary

Migrate Mission Trip Platform from vanilla HTML/CSS/JavaScript to **React with modern design system** for better maintainability, scalability, and user experience. The codebase is ~15.4K lines - a manageable migration that will result in ~40-50% less code through React's component reusability.

**Timeline:** 2-3 weeks for full migration
**Target Launch:** Fresh React-based UI with modern design
**Key Priority:** Beautification with smooth animations, modern aesthetics, mobile-first design

---

## Phase 1: Project Setup & Architecture (Days 1-2)

### 1.1 React Project Initialization

**Technology Stack:**
- **Build Tool:** Vite (faster than CRA, better DX)
- **Framework:** React 18+ with JSX
- **Package Manager:** npm
- **Styling:** Tailwind CSS + custom CSS modules for complex components
- **State Management:** React Context API + custom hooks
- **HTTP Client:** Existing Supabase SDK (no change needed)
- **Deployment:** Vercel (same as now)

**Setup Steps:**
```bash
npm create vite@latest mission-trip-platform -- --template react
cd mission-trip-platform
npm install
npm install @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

**Project Structure:**
```
mission-trip-platform/
├── public/
│   ├── assets/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Toast.jsx
│   │   ├── layout/
│   │   │   ├── PortalLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── Sidebar.jsx
│   │   └── features/
│   │       ├── auth/
│   │       ├── students/
│   │       ├── payments/
│   │       ├── questions/
│   │       ├── admin/
│   │       └── ...
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Home.jsx
│   │   ├── AdminPortal.jsx
│   │   ├── ParentPortal.jsx
│   │   ├── StudentPortal.jsx
│   │   ├── QuestionsPortal.jsx
│   │   ├── ContentManagement.jsx
│   │   ├── SuperAdminPortal.jsx
│   │   └── NotFound.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── TenantContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── hooks/
│   │   ├── useApi.js
│   │   ├── useAuth.js
│   │   ├── useTenant.js
│   │   ├── useTheme.js
│   │   ├── useToast.js
│   │   └── ...
│   ├── lib/
│   │   ├── api.js (converted from vanilla)
│   │   ├── config.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── theme.css
│   │   └── animations.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### 1.2 Routing Setup

**Using React Router:**
```bash
npm install react-router-dom
```

**Route Structure:**
```jsx
// App.jsx
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/home" element={<Home />} />
      <Route path="/parent-portal" element={<ParentPortal />} />
      <Route path="/student-portal" element={<StudentPortal />} />
      <Route path="/admin-portal" element={<AdminPortal />} />
      <Route path="/questions" element={<QuestionsPortal />} />
      <Route path="/content" element={<ContentManagement />} />
      <Route path="/super-admin" element={<SuperAdminPortal />} />
    </Route>
  </Routes>
</BrowserRouter>
```

---

## Phase 2: Design System & Components (Days 2-4)

### 2.1 Modern Design System

**Color Palette:**
```css
/* Primary Brand Colors */
--primary: #4F46E5         /* Deep Indigo */
--primary-dark: #4338CA    /* Darker Indigo */
--primary-light: #818CF8   /* Light Indigo */

/* Secondary Colors */
--secondary: #10B981       /* Emerald Green */
--secondary-dark: #059669  /* Dark Emerald */
--secondary-light: #34D399 /* Light Emerald */

/* Accent Color */
--accent: #F59E0B         /* Amber */
--accent-dark: #D97706    /* Dark Amber */

/* Neutral/Gray Scale */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827

/* Status Colors */
--success: #10B981       /* Green */
--warning: #F59E0B       /* Amber */
--error: #EF4444         /* Red */
--info: #3B82F6          /* Blue */

/* Dark Mode Background */
--bg-dark-primary: #111827    /* Near black */
--bg-dark-secondary: #1F2937  /* Dark gray */
--bg-dark-tertiary: #374151   /* Lighter gray */

/* Light Mode Background */
--bg-light-primary: #FFFFFF
--bg-light-secondary: #F9FAFB
--bg-light-tertiary: #F3F4F6
```

**Typography System:**
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
             'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;

/* Size Scale */
--text-xs: 0.75rem (12px)     /* captions, small labels */
--text-sm: 0.875rem (14px)    /* small text, helper text */
--text-base: 1rem (16px)      /* body text */
--text-lg: 1.125rem (18px)    /* subheadings */
--text-xl: 1.25rem (20px)     /* section headings */
--text-2xl: 1.5rem (24px)     /* page headings */
--text-3xl: 1.875rem (30px)   /* hero headings */

/* Line Height */
--lh-tight: 1.2
--lh-normal: 1.5
--lh-relaxed: 1.75
```

**Spacing Scale (8px base):**
```css
--space-0: 0
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
```

**Shadow System:**
```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

**Border Radius Scale:**
```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-full: 9999px
```

### 2.2 Animation System

**Smooth Transitions (Inspired by Figma, Stripe, Instagram):**
```css
/* Duration & Easing */
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 350ms

--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)

/* Core Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 2.3 Core Component Library

**Example: Modern Button Component**
```jsx
// src/components/common/Button.jsx
import React from 'react';
import './Button.module.css';

export const Button = ({
  children,
  variant = 'primary',      // primary, secondary, outline, danger, ghost
  size = 'md',              // sm, md, lg
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark active:scale-95',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-error text-white hover:bg-red-700 active:scale-95',
    ghost: 'text-primary hover:bg-primary hover:bg-opacity-10',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg min-h-[44px]', // Touch target
  };

  return (
    <button
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]}
        font-medium transition-all duration-150 ease-smooth
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'opacity-70 cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center">
          <span className="animate-spin mr-2">⚙️</span>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

**Example: Card Component**
```jsx
// src/components/common/Card.jsx
export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-bg-dark-secondary
        rounded-lg border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-smooth
        p-4 ${hover ? 'hover:border-primary' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
```

---

## Phase 3: Contexts & Hooks (Days 3-5)

### 3.1 Auth Context
```jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    checkUser();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.2 Tenant Context
```jsx
// src/contexts/TenantContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
  const [churchId, setChurchId] = useState(null);
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Detect church from URL or query params
    const params = new URLSearchParams(window.location.search);
    const churchParam = params.get('church');
    const pathMatch = window.location.pathname.match(/\/([\w-]+)\//);
    const detectedChurchId = churchParam || pathMatch?.[1];

    if (detectedChurchId) {
      setChurchId(detectedChurchId);
    }
    setLoading(false);
  }, []);

  return (
    <TenantContext.Provider value={{ churchId, church, loading }}>
      {children}
    </TenantContext.Provider>
  );
};
```

### 3.3 Theme Context
```jsx
// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('themeMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;

    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      localStorage.setItem('themeMode', newValue ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', newValue ? 'dark' : 'light');
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 3.4 Custom Hooks

**useAuth Hook:**
```jsx
// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**useApi Hook:**
```jsx
// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import * as API from '../lib/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
};
```

---

## Phase 4: API Layer Conversion (Days 5-6)

### 4.1 Migrate api.js to React Hooks

The existing `api.js` (1581 lines) contains 80+ functions. Convert these to custom hooks:

```jsx
// src/hooks/useStudents.js
import { useState, useCallback } from 'react';
import { supabase } from '../lib/config';
import { useTenant } from './useTenant';

export const useStudents = () => {
  const { churchId } = useTenant();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMyStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error: err } = await supabase
        .from('students')
        .select('*')
        .eq('church_id', churchId)
        .eq('parent_id', user.user.id);

      if (err) throw err;
      setStudents(data || []);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [churchId]);

  const createStudent = useCallback(async (studentData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data, error: err } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          church_id: churchId,
          parent_id: user.user.id
        }])
        .select();

      if (err) throw err;
      setStudents(prev => [...prev, data[0]]);
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [churchId]);

  // ... more functions

  return {
    students,
    loading,
    error,
    getMyStudents,
    createStudent,
    // ... other functions
  };
};
```

**Organize hooks by domain:**
- `useStudents.js` - Student management
- `usePayments.js` - Payment tracking
- `useDocuments.js` - Document uploads
- `useMemories.js` - Trip memories
- `useEvents.js` - Event management
- `useQuestions.js` - Question submission
- `useFAQ.js` - FAQ management
- `useResources.js` - Resource management

---

## Phase 5: Page Migration (Days 6-10)

### 5.1 Migration Order (Suggested)

1. **Login & Auth Pages** (easiest, quick win)
   - Login.jsx
   - Signup.jsx
   - ProtectedRoute.jsx

2. **Homepage** (core navigation hub)
   - Home.jsx (from index.html)
   - Shows trip info, countdown, events, FAQs

3. **Parent Portal**
   - ParentPortal.jsx
   - StudentManagement.jsx
   - DocumentUpload.jsx
   - PaymentStatus.jsx

4. **Admin Portal**
   - AdminPortal.jsx
   - StudentList.jsx
   - DocumentApproval.jsx
   - MemoryApproval.jsx
   - EventManagement.jsx

5. **Questions & Content**
   - QuestionsPortal.jsx
   - ContentManagement.jsx

6. **Super Admin Portal**
   - SuperAdminPortal.jsx
   - ChurchManagement.jsx
   - UserManagement.jsx

### 5.2 Example: Login Page Migration

**Before (Vanilla JS):**
```html
<!-- login.html - 300+ lines of HTML/JS mix -->
<form onsubmit="handleLogin(event)">
  <input id="email" type="email" />
  <input id="password" type="password" />
  <button type="submit">Login</button>
</form>

<script>
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  // ... logic
}
</script>
```

**After (React):**
```jsx
// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/home');
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};
```

---

## Phase 6: Testing & Deployment (Days 10-14)

### 6.1 Testing Checklist

- [ ] All API calls work (use React Query/SWR for better caching)
- [ ] Authentication flow complete (login → redirect → logout)
- [ ] Multi-tenant isolation (can't see other church data)
- [ ] All portals functional (admin, parent, student, super-admin)
- [ ] Dark mode works across all pages
- [ ] Mobile responsive (tested on iPhone/Android)
- [ ] File uploads working
- [ ] RLS policies enforced
- [ ] No console errors
- [ ] Animations smooth and performant
- [ ] Performance metrics good (Lighthouse score)

### 6.2 Deployment Strategy

**Two Options:**

**Option A: Blue-Green Deployment** (Recommended)
1. Deploy React app to separate branch/domain (`react.domain.com`)
2. Run parallel with vanilla version
3. Test thoroughly (2-3 days)
4. Switch primary domain to React version
5. Keep vanilla as backup

**Option B: Feature Flag Approach**
1. Deploy both versions simultaneously
2. Use feature flag to route users to React version
3. Gradually roll out to 50% → 100% of users
4. Rollback if issues detected

---

## Effort Estimate Summary

| Phase | Duration | Tasks | Notes |
|-------|----------|-------|-------|
| 1. Setup | 2 days | Vite, routing, structure | Critical foundation |
| 2. Design System | 2 days | Colors, typography, components | Reusable foundation |
| 3. Contexts & Hooks | 2 days | Auth, theme, tenant, toast | Global state management |
| 4. API Layer | 2 days | Convert 80+ functions to hooks | Maintain API compatibility |
| 5. Page Migration | 4 days | Convert 8 main pages | Largest phase, can parallelize |
| 6. Polish & Test | 2 days | Fix bugs, optimize, deploy | QA & performance |
| **Total** | **14 days** | **~40-50% code reduction** | **Professional results** |

---

## Key Benefits After Migration

✅ **Code Reduction:** ~15K lines → ~8-10K lines (component reusability)
✅ **Maintainability:** Separation of concerns (components, hooks, contexts)
✅ **Performance:** Lazy loading, code splitting, optimized re-renders
✅ **DX:** Hot module replacement, faster development
✅ **Modern Aesthetics:** Smooth animations, modern design system
✅ **Mobile-First:** Better gesture handling, responsive design
✅ **Extensibility:** Easy to add new features and 3rd-party integrations
✅ **Scalability:** Ready for 100+ churches with modular architecture

---

## Next Steps

1. **Confirm Tech Stack:**
   - ✅ Vite for build tool
   - ✅ React 18 for framework
   - ⏳ Tailwind CSS or styled-components?
   - ⏳ React Query or SWR for data fetching?
   - ⏳ Zustand or Redux for complex state?

2. **Design System Finalization:**
   - ✅ Color palette approved
   - ⏳ Animation library review
   - ⏳ Component specifications

3. **Start Phase 1 (Setup):**
   - Initialize Vite project
   - Set up routing structure
   - Configure Supabase integration

---

## References

- Vite: https://vitejs.dev
- React: https://react.dev
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- Supabase JS: https://supabase.com/docs/reference/javascript
