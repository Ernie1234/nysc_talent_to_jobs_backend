import { Schema, model, Document, Types } from 'mongoose';

// Enums for job-related fields
export const jobTypeEnum = [
  'fulltime',
  'part-time',
  'contract',
  'freelance',
  'intern',
  'co-founder',
] as const;
export const experienceLevelEnum = [
  'intern',
  'entry-level',
  'mid-level',
  'senior-level',
  'executive',
] as const;
export const workLocationEnum = ['remote', 'on-site', 'hybrid'] as const;
export const jobPeriodEnum = [
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'more than 12 months',
  'permanent',
] as const;
export const jobStatusEnum = ['draft', 'published', 'closed', 'archived'] as const;

export type JobType = (typeof jobTypeEnum)[number];
export type ExperienceLevel = (typeof experienceLevelEnum)[number];
export type WorkLocation = (typeof workLocationEnum)[number];
export type JobPeriod = (typeof jobPeriodEnum)[number];
export type JobStatus = (typeof jobStatusEnum)[number];

// Salary range interface
export interface ISalaryRange {
  min: number;
  max: number;
  currency: string;
  isPublic: boolean;
}

// Hiring location interface
export interface IHiringLocation {
  type: 'nation-wide' | 'state';
  state?: string;
}

// Job interface
export interface IJob extends Document {
  _id: Types.ObjectId;
  employerId: Types.ObjectId;
  title: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  workLocation: WorkLocation;
  jobPeriod: JobPeriod;
  skills: string[];
  aboutJob: string;
  requirements: string;
  salaryRange: ISalaryRange;
  hiringLocation: IHiringLocation;
  status: JobStatus;
  applicationCount: number;
  viewCount: number;
  applicants: Types.ObjectId[];
  publishedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const salaryRangeSchema = new Schema<ISalaryRange>(
  {
    min: {
      type: Number,
      required: true,
      min: 0,
    },
    max: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NR',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const hiringLocationSchema = new Schema<IHiringLocation>(
  {
    type: {
      type: String,
      enum: ['nation-wide', 'state'],
      required: true,
    },
    state: {
      type: String,
      required(this: IHiringLocation) {
        return this.type === 'state';
      },
    },
  },
  { _id: false }
);

const jobSchema = new Schema<IJob>(
  {
    employerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    jobType: {
      type: String,
      enum: jobTypeEnum,
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type: String,
      enum: experienceLevelEnum,
      required: [true, 'Experience level is required'],
    },
    workLocation: {
      type: String,
      enum: workLocationEnum,
      required: [true, 'Work location is required'],
    },
    jobPeriod: {
      type: String,
      enum: jobPeriodEnum,
      required: [true, 'Job period is required'],
    },
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Skill cannot exceed 50 characters'],
      },
    ],
    aboutJob: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [2000, 'Job description cannot exceed 2000 characters'],
    },
    requirements: {
      type: String,
      required: [true, 'Job requirements are required'],
      maxlength: [1000, 'Job requirements cannot exceed 1000 characters'],
    },
    salaryRange: {
      type: salaryRangeSchema,
      required: true,
    },
    hiringLocation: {
      type: hiringLocationSchema,
      required: true,
    },
    status: {
      type: String,
      enum: jobStatusEnum,
      default: 'draft',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    applicants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Applicant',
        default: [],
      },
    ],
    publishedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const transformed = ret as any;
        transformed.id = transformed._id;
        delete transformed._id;
        delete transformed.__v;
        return transformed;
      },
    },
  }
);

// Indexes for better query performance
jobSchema.index({ employerId: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ 'hiringLocation.type': 1, 'hiringLocation.state': 1 });
jobSchema.index({ jobType: 1, experienceLevel: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ applicants: 1 });

// Virtual for isActive
jobSchema.virtual('isActive').get(function (this: IJob) {
  return this.status === 'published';
});

// Virtual for populated applicants
jobSchema.virtual('applicantDetails', {
  ref: 'Applicant',
  localField: 'applicants',
  foreignField: '_id',
});

// Pre-save middleware to handle publishedAt
jobSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }

  // Sync applicationCount with applicants array length
  if (this.isModified('applicants')) {
    this.applicationCount = this.applicants.length;
  }

  next();
});

export const JobModel = model<IJob>('Job', jobSchema);
