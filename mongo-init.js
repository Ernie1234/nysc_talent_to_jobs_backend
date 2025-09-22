// MongoDB initialization script for development
db = db.getSiblingDB('nysc_talents_jobs_dev');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^\\S+@\\S+\\.\\S+$',
          description: 'must be a valid email and is required'
        },
        firstName: {
          bsonType: 'string',
          maxLength: 50,
          description: 'must be a string with max 50 characters and is required'
        },
        lastName: {
          bsonType: 'string',
          maxLength: 50,
          description: 'must be a string with max 50 characters and is required'
        },
        role: {
          enum: ['corps_member', 'employer', 'admin'],
          description: 'must be one of the enum values'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ onboardingCompleted: 1 });
db.users.createIndex({ createdAt: -1 });

print('Database initialized successfully!');