import mongoose from 'mongoose';
import { env } from './env';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
