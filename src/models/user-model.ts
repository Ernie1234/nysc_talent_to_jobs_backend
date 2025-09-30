import { Schema, model, Document, Types } from 'mongoose';
import { compareValue, hashValue } from '@/utils/bcrypt-config';

// Skill level enum
export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// Skill interface
export interface ISkill {
  _id: Types.ObjectId;
  name: string;
  level: SkillLevel;
  yearsOfExperience?: number;
}

// Enhanced profile interface
export interface IUserProfile {
  phoneNumber?: string;
  stateOfService?: string;
  placeOfPrimaryAssignment?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  skills?: ISkill[];
  bio?: string;
  profilePicture?: string;
  resume?: string;
  linkedin?: string;
  github?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  firstName: string;
  lastName: string;
  role: 'corps_member' | 'employer' | 'nitda';
  onboardingCompleted: boolean;
  onboardingStep: number;
  profile?: IUserProfile;
  personalInfo?: Types.ObjectId;
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
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  omitPassword: () => Omit<IUser, 'password'>;
}

const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters'],
  },
  level: {
    type: String,
    enum: Object.values(SkillLevel),
    required: [true, 'Skill level is required'],
    default: SkillLevel.BEGINNER,
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
  },
});

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      validate: {
        validator(email: string) {
          // Special validation for NITDA emails
          if (email.toLowerCase().endsWith('@nitda.gov.ng')) {
            return true;
          }
          // Standard email validation for other emails
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
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
      enum: ['corps_member', 'employer', 'nitda'],
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
      max: 5,
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
      address: {
        street: { type: String, maxlength: [200, 'Street cannot exceed 200 characters'] },
        city: { type: String, maxlength: [100, 'City cannot exceed 100 characters'] },
        state: { type: String, maxlength: [100, 'State cannot exceed 100 characters'] },
        country: { type: String, maxlength: [100, 'Country cannot exceed 100 characters'] },
        postalCode: { type: String, maxlength: [20, 'Postal code cannot exceed 20 characters'] },
      },
      skills: [skillSchema],
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
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      },
    },
    personalInfo: {
      type: Schema.Types.ObjectId,
      ref: 'PersonalInfo',
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
  }
);

// Index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ onboardingCompleted: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await hashValue(this.password);
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (value: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return compareValue(value, this.password);
};

// Add the method back to the schema
userSchema.methods.omitPassword = function (): Omit<IUser, 'password'> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const UserModel = model<IUser>('User', userSchema);
