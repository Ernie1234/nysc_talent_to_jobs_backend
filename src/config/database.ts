import mongoose from 'mongoose';
import envConfig from '@/config/env-config';
import Logger from '@/utils/logger';
const env = envConfig();

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI as string, {
      bufferCommands: false,
    });

    Logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      Logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.info('MongoDB disconnected');
    });

    // Handle app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      Logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    Logger.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
