import { Request } from 'express';
import { IUser } from '@/models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type UserRole = 'corps_member' | 'employer' | 'admin';

export interface OnboardingData {
  step: number;
  isComplete: boolean;
  data: Record<string, any>;
}
