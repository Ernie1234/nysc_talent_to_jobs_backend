export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYER = 'employer',
  TALENT = 'talent',
}

export interface UserProfile {
  bio?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profile?: Partial<UserProfile>;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: Omit<User, 'password'>;
}