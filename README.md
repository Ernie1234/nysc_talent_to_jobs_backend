# NYSC Talents to Jobs Backend API

A robust Node.js backend API built with Express.js and TypeScript for the NYSC Talents to Jobs platform. This API provides authentication, user management, and job matching services for NYSC corps members and employers.

## 🚀 Features

- **TypeScript**: Full TypeScript support for type safety and better development experience
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Testing**: Comprehensive test suite with Jest and Supertest
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment
- **Documentation**: OpenAPI/Swagger documentation (coming soon)
- **Linting**: ESLint and Prettier for code quality and formatting

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nysc_talents_to_jobs_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration values.

4. **Build the project**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:5000` with hot reloading.

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📁 Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.ts
│   └── userController.ts
├── middleware/          # Custom middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── notFound.ts
├── routes/             # API routes
│   ├── authRoutes.ts
│   └── userRoutes.ts
├── types/              # TypeScript type definitions
│   └── user.ts
├── config/             # Configuration files
├── models/             # Data models (future database integration)
├── services/           # Business logic services
├── utils/              # Utility functions
└── server.ts           # Main application entry point

tests/                  # Test files
├── auth.test.ts
└── setup.ts

.github/
└── workflows/
    └── ci-cd.yml       # GitHub Actions CI/CD pipeline
```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | Private |
| PUT | `/:id` | Update user | Private/Admin |
| DELETE | `/:id` | Delete user | Private/Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Health check endpoint | Public |

## 📝 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "talent"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "talent",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production/test) | Yes |
| `PORT` | Server port | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## 🧪 Testing

The project includes comprehensive test coverage using Jest and Supertest:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and middleware
- **Coverage Reports**: Generate detailed coverage reports

Test files are located in the `tests/` directory and follow the naming convention `*.test.ts`.

## 🚢 Deployment

### GitHub Actions CI/CD

The project includes a GitHub Actions workflow that:

1. **Testing**: Runs tests on Node.js 18.x and 20.x
2. **Linting**: Checks code quality and formatting
3. **Building**: Compiles TypeScript to JavaScript
4. **Deployment**: Deploys to your chosen platform (configure as needed)

### Deployment Platforms

The CI/CD pipeline supports deployment to:
- Railway
- Heroku
- DigitalOcean App Platform
- Vercel
- AWS Lambda

Uncomment and configure the relevant deployment step in `.github/workflows/ci-cd.yml`.

## 📚 Database Integration

The current implementation uses in-memory storage for demonstration purposes. To integrate with a database:

1. **Choose your database**: MongoDB, PostgreSQL, MySQL, etc.
2. **Install database client**: Mongoose, Prisma, TypeORM, etc.
3. **Update models**: Replace mock storage with actual database models
4. **Add connection**: Configure database connection in `src/config/`

## 🔧 Configuration

### TypeScript Configuration
- Strict type checking enabled
- Path mapping for clean imports (`@/` prefix)
- Source maps for debugging

### ESLint Configuration
- TypeScript ESLint rules
- Consistent code formatting
- Custom rules for project standards

### Jest Configuration
- TypeScript support with ts-jest
- Coverage reporting
- Path mapping support
- Isolated test environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](../../issues) on GitHub.

## 📞 Support

For support and questions, please contact:
- Email: anumahjoshuaeneye@gmail.com
- GitHub: [@Ernie1234](https://github.com/Ernie1234)

---

Built with ❤️ by [Anumah Joshua Eneye](https://github.com/Ernie1234)