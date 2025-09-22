import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'corps_member' | 'employer' | 'admin';
  onboardingCompleted: boolean;
  onboardingStep: number;
  profile?: {
    phoneNumber?: string;
    stateOfService?: string;
    placeOfPrimaryAssignment?: string;
    skills?: string[];
    bio?: string;
    profilePicture?: string;
    resume?: string;
    linkedin?: string;
    github?: string;
  };
  employerProfile?: {
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyDescription?: string;
    website?: string;
    location?: string;
  };
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: ['corps_member', 'employer', 'admin'],
      default: 'corps_member',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5, // Adjust based on your onboarding flow
    },
    profile: {
      phoneNumber: {
        type: String,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
      },
      stateOfService: {
        type: String,
        maxlength: [100, 'State of service cannot exceed 100 characters'],
      },
      placeOfPrimaryAssignment: {
        type: String,
        maxlength: [200, 'Place of primary assignment cannot exceed 200 characters'],
      },
      skills: [
        {
          type: String,
          trim: true,
          maxlength: [50, 'Skill name cannot exceed 50 characters'],
        },
      ],
      bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      },
      profilePicture: String,
      resume: String,
      linkedin: {
        type: String,
        match: [/^https?:\/\/.*linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL'],
      },
      github: {
        type: String,
        match: [/^https?:\/\/.*github\.com\/.*/, 'Please enter a valid GitHub URL'],
      },
    },
    employerProfile: {
      companyName: {
        type: String,
        maxlength: [100, 'Company name cannot exceed 100 characters'],
      },
      companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      },
      industry: {
        type: String,
        maxlength: [100, 'Industry cannot exceed 100 characters'],
      },
      companyDescription: {
        type: String,
        maxlength: [1000, 'Company description cannot exceed 1000 characters'],
      },
      website: {
        type: String,
        match: [/^https?:\/\/.*/, 'Please enter a valid website URL'],
      },
      location: {
        type: String,
        maxlength: [100, 'Location cannot exceed 100 characters'],
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any): any => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.emailVerificationToken;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ onboardingCompleted: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);
