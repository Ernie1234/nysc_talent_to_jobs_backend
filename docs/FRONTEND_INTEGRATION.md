# Frontend Integration Guide

This guide shows how to integrate your React frontend with the NYSC Talents to Jobs backend using TanStack Query (React Query).

## Table of Contents
- [Setup](#setup)
- [API Configuration](#api-configuration)
- [Authentication Hooks](#authentication-hooks)
- [React Query Setup](#react-query-setup)
- [Usage Examples](#usage-examples)
- [TypeScript Types](#typescript-types)

## Setup

### 1. Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools axios zod
npm install -D @types/axios
```

### 2. Environment Variables

Create a `.env.local` file in your React app:

```env
NEXT_PUBLIC_API_URL=https://nysc-talent-to-jobs-backend.onrender.com
NEXT_PUBLIC_API_URL_DEV=http://localhost:5000
```

## API Configuration

### `src/lib/api.ts`

```typescript
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:5000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

## TypeScript Types

### `src/types/auth.ts`

```typescript
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  provider: 'local' | 'google';
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  error?: { message: string };
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'job_seeker' | 'employer';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

## Authentication Hooks

### `src/hooks/useAuth.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { User, AuthResponse, RegisterInput, LoginInput, ApiError } from '../types/auth';

// Auth API functions
const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: true; data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorage.getItem('auth-token'),
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user-data', JSON.stringify(data.user));
        queryClient.setQueryData(['currentUser'], { success: true, data: data.user });
      }
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user-data', JSON.stringify(data.user));
        queryClient.setQueryData(['currentUser'], { success: true, data: data.user });
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });

  return {
    user: currentUser?.data,
    isAuthenticated: !!currentUser?.data,
    isLoading: isLoadingUser,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as ApiError,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as ApiError,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
```

## React Query Setup

### `src/providers/QueryProvider.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except 429
              if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### `src/app/layout.tsx` (Next.js App Router)

```typescript
import QueryProvider from '../providers/QueryProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## Usage Examples

### Login Component

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginInput } from '../types/auth';

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          required
        />
      </div>

      {loginError && (
        <div className="text-red-600 text-sm">
          {loginError.error?.message || 'Login failed'}
          {loginError.error?.details && (
            <ul className="mt-1">
              {loginError.error.details.map((detail, index) => (
                <li key={index}>• {detail.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoggingIn}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoggingIn ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Google OAuth Button */}
      <a
        href="${API_URL}/api/auth/google"
        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 text-center block"
      >
        Continue with Google
      </a>
    </form>
  );
}
```

### Protected Route Component

```typescript
'use client';

import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'job_seeker' | 'employer' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (requiredRole && user && user.role !== requiredRole && user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [user, requiredRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
}
```

### Google OAuth Success Handler

```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('auth-token', token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/dashboard');
    } else {
      router.push('/auth/login?error=oauth_failed');
    }
  }, [searchParams, router, queryClient]);

  return <div>Processing login...</div>;
}
```

## API Endpoints

The backend provides these endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /health` - Health check

## Error Handling

The backend returns consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

## Testing

You can test the API endpoints using:

```bash
# Health check
curl https://nysc-talent-to-jobs-backend.onrender.com/health

# Register
curl -X POST https://nysc-talent-to-jobs-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST https://nysc-talent-to-jobs-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```