# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the backend API for the NYSC Talents to Jobs platform, built with Node.js, TypeScript, and Express. The project uses Bun as the JavaScript runtime and package manager, with a focus on connecting NYSC corps members with job opportunities.

## Quick Start

### Prerequisites
- Bun v1.2.22 or later
- MongoDB (local or Atlas)
- Docker (optional, for containerized development)

### Setup and Installation
```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your actual values
# Required: MONGODB_URI, JWT_SECRET
```

### Development Commands

```bash
# Start development server with hot reload
bun run dev

# Type checking
bun run type-check

# Linting and formatting
bun run lint          # Check for linting errors
bun run lint:fix      # Fix auto-fixable linting errors
bun run format        # Format code with Prettier
bun run format:check  # Check if code is properly formatted
```

### Building and Production
```bash
# Build the TypeScript project
bun run build

# Start production server
bun run start

# Clean build directory
bun run clean
```

### Docker Development
```bash
# Start all services (app + MongoDB)
bun run docker:dev

# Stop all services
bun run docker:dev:down

# Start MongoDB admin interface (optional)
bun run db:tools
# Access at http://localhost:8081 (admin/pass)

# Production Docker build
bun run docker:prod
```

## Architecture and Structure

### Path Aliases
The project uses TypeScript path mapping for clean imports:
- `@/*` → `src/*`
- `@/config/*` → `src/config/*`
- `@/controllers/*` → `src/controllers/*`
- `@/middleware/*` → `src/middleware/*`
- `@/models/*` → `src/models/*`
- `@/routes/*` → `src/routes/*`
- `@/services/*` → `src/services/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`

### Expected Directory Structure
Based on the TypeScript configuration and dependencies, the project expects:
- **Controllers**: Route handlers and business logic
- **Models**: MongoDB/Mongoose data models
- **Routes**: API endpoint definitions
- **Services**: Business logic and external integrations
- **Middleware**: Authentication, validation, error handling
- **Utils**: Helper functions and utilities
- **Types**: TypeScript type definitions
- **Config**: Application configuration

### Key Technologies and Integrations
- **Runtime**: Bun v1.2.22+ (all-in-one JavaScript runtime)
- **Framework**: Express.js v5+ 
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **File Upload**: Multer with Cloudinary integration
- **Email**: Resend for email services
- **AI Integration**: Google Generative AI (@google/genai)
- **Validation**: Zod for schema validation
- **Security**: Helmet for security headers, bcrypt for password hashing
- **Scheduling**: node-cron for background tasks

### Development Notes
- The project is configured for ES modules (`"type": "module"`)
- Uses `tsx` for TypeScript execution in development
- Hot reloading configured via nodemon/tsx watch
- Source code compiles from `src/` to `dist/`
- Environment variables should be stored in `.env` (excluded from git)

## Environment and Configuration
- Create `.env` files for environment-specific variables
- The project expects integration with:
  - MongoDB database
  - Cloudinary for file storage
  - Resend for email services
  - Google Generative AI services

## Code Quality and Linting

### ESLint Configuration
- Uses Airbnb TypeScript style guide
- Configured with Prettier integration
- Custom rules for Node.js backend development
- Import resolver configured for TypeScript path aliases

### Prettier Configuration
- Single quotes, semicolons enabled
- 100 character line width
- 2-space indentation
- Trailing commas (ES5 compatible)

## Database Schema

### User Model (`src/models/User.ts`)
The User model includes comprehensive fields for the NYSC platform:

**Core Fields:**
- `email`, `password`, `firstName`, `lastName`
- `role`: 'interns' | 'staff' | 'admin'

**Onboarding System:**
- `onboardingCompleted`: Boolean flag for completion status
- `onboardingStep`: Number (1-5) tracking current onboarding step
- Use these fields to guide users through registration flow

**Profile Data:**
- Corps member: `stateOfService`, `placeOfPrimaryAssignment`, `skills`, `bio`
- staff: `companyName`, `companySize`, `industry`, `companyDescription`
- File uploads: `profilePicture`, `resume`
- Social links: `linkedin`, `github`

## Deployment

### Render Deployment
- Automatic deployment via GitHub Actions on push to `main`
- Environment variables managed in Render dashboard
- Health check endpoint: `/health`

**Required Render Environment Variables:**
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: At least 32 characters
- `NODE_ENV`: production
- `PORT`: Automatically set by Render
- `CORS_ORIGIN`: Your frontend domain

**GitHub Secrets Required:**
- `RENDER_SERVICE_ID`: Your Render service ID
- `RENDER_API_KEY`: Render API key for deployments

### GitHub Actions Pipeline
1. **Test Stage**: Type checking, linting, formatting checks, build test
2. **Deploy Stage**: Automatic deployment to Render (main branch only)

## Development Workflow

### Starting Development
1. Copy `.env.example` to `.env` and configure
2. Start MongoDB (local or Docker: `bun run docker:dev`)
3. Run development server: `bun run dev`
4. Server available at: http://localhost:5000
5. Health check: http://localhost:5000/health

### Before Committing
```bash
bun run type-check    # Ensure no TypeScript errors
bun run lint:fix      # Fix linting issues
bun run format        # Format code
```

### Working with User Onboarding
After user registration, use the onboarding fields to:
1. Check `onboardingCompleted` to redirect incomplete users
2. Use `onboardingStep` to show appropriate onboarding screens
3. Increment `onboardingStep` as users complete each step
4. Set `onboardingCompleted: true` when flow is finished

## Current Implementation Status
- ✅ Project structure and configuration
- ✅ User model with onboarding system
- ✅ Express server with middleware
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ❌ Authentication routes and middleware
- ❌ User onboarding API endpoints
- ❌ Job posting and matching features

## Next Development Steps
1. Implement JWT authentication middleware
2. Create user registration and login endpoints
3. Build onboarding API routes
4. Add file upload functionality
5. Develop job posting system
