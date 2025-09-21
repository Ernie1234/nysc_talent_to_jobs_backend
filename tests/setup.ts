import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
});

// Global test configuration
jest.setTimeout(10000);