# NYSC Talents to Jobs - Backend API

A Node.js/TypeScript backend API for connecting NYSC corps members with job opportunities, built with Express, MongoDB, and modern development practices.

## Features

- 🚀 **Modern Stack**: Node.js, TypeScript, Express, MongoDB
- 🏃 **Fast Runtime**: Powered by Bun for lightning-fast development
- 🛡️ **Type Safety**: Full TypeScript implementation with strict typing
- 🎨 **Code Quality**: ESLint + Prettier with Airbnb style guide
- 🐳 **Containerized**: Docker setup for development and production
- 🔄 **CI/CD**: GitHub Actions pipeline with automatic Render deployment
- 👤 **User System**: Comprehensive user model with onboarding flow
- 🔐 **Security**: JWT authentication, password hashing, security headers

## Quick Start

### Prerequisites
- Bun v1.2.22 or later
- MongoDB (local or Atlas)
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nysc_talents_to_jobs_backend

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development server
bun run dev
```

## Development Commands

```bash
# Development
bun run dev              # Start development server with hot reload
bun run type-check       # Run TypeScript type checking

# Code Quality
bun run lint            # Check for linting errors
bun run lint:fix        # Fix auto-fixable linting errors  
bun run format          # Format code with Prettier
bun run format:check    # Check if code is properly formatted

# Building
bun run build           # Build for production
bun run start           # Start production server
bun run clean           # Clean build directory

# Docker
bun run docker:dev      # Start all services (app + MongoDB)
bun run docker:dev:down # Stop all services
bun run docker:prod     # Production build
bun run db:tools        # Start MongoDB admin interface
```

## Project Structure

```
src/
├── config/          # Configuration files (database, environment)
├── controllers/     # Route handlers and business logic
├── middleware/      # Custom middleware (auth, error handling)
├── models/          # MongoDB/Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic and external integrations
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── server.ts        # Main application entry point
```

## User Onboarding System

The User model includes a sophisticated onboarding system:

- `onboardingCompleted`: Boolean flag for completion status
- `onboardingStep`: Number (1-5) tracking current step
- Progressive profile completion for both corps members and staff

## Environment Variables

Required variables (see `.env.example`):

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret (min 32 characters)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `CORS_ORIGIN`: Frontend domain for CORS

Optional integrations:
- `CLOUDINARY_*`: File upload service
- `RESEND_API_KEY`: Email service
- `GOOGLE_AI_API_KEY`: AI features

## Deployment

### Render Deployment

1. Push to `main` branch triggers automatic deployment
2. Set environment variables in Render dashboard
3. GitHub secrets required:
   - `RENDER_SERVICE_ID`
   - `RENDER_API_KEY`

### Docker Deployment

```bash
# Production build
docker build -t nysc-backend .

# Run with environment file
docker run --env-file .env.production -p 5000:5000 nysc-backend
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/v1/*` - API routes (to be implemented)

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js + JWT
- **File Storage**: Cloudinary
- **Email**: Resend
- **AI**: Google Generative AI
- **Validation**: Zod
- **Testing**: (To be added)
- **Deployment**: Render with GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `bun run type-check && bun run lint:fix`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
