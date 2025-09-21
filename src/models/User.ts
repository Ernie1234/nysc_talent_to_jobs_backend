import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'job_seeker' | 'employer' | 'admin';
  isEmailVerified: boolean;
  
  // Google OAuth fields
  googleId?: string;
  provider: 'local' | 'google';
  
  // Profile information
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return this.provider === 'local';
      },
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['job_seeker', 'employer', 'admin'],
      default: 'job_seeker',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    
    // Google OAuth fields
    googleId: {
      type: String,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    
    // Profile information
    phone: String,
    location: String,
    bio: String,
    skills: [String],
    experience: String,
    
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform JSON output
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;