// models/applicant-model.ts
import { Schema, model, Document, Types } from 'mongoose';

export const applicationStatusEnum = [
  'pending',
  'under_review',
  'shortlisted',
  'interview',
  'rejected',
  'accepted',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof applicationStatusEnum)[number];

export interface IApplicant extends Document {
  _id: Types.ObjectId;
  jobId: Types.ObjectId;
  staffId: Types.ObjectId;
  userId: Types.ObjectId;
  documentId?: Types.ObjectId;
  resumeUploadId?: Types.ObjectId;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  __v?: number;
}

const applicantSchema = new Schema<IApplicant>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document', // Reference to the resume document
      index: true,
    },
    resumeUploadId: {
      type: Schema.Types.ObjectId,
      ref: 'ResumeUpload', // Reference to uploaded resume file
      index: true,
    },
    status: {
      type: String,
      enum: applicationStatusEnum,
      default: 'pending',
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
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

applicantSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicantSchema.index({ userId: 1, status: 1 });
applicantSchema.index({ jobId: 1, status: 1 });
applicantSchema.index({ appliedAt: -1 });

// Virtual for applicant details (will be populated)
applicantSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for job details (will be populated)
applicantSchema.virtual('job', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for staff details (will be populated)
applicantSchema.virtual('staff', {
  ref: 'User',
  localField: 'staffId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for resume document details
applicantSchema.virtual('resumeDocument', {
  ref: 'Document',
  localField: 'documentId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for uploaded resume file details
applicantSchema.virtual('uploadedResume', {
  ref: 'ResumeUpload',
  localField: 'resumeUploadId',
  foreignField: '_id',
  justOne: true,
});

export const ApplicantModel = model<IApplicant>('Applicant', applicantSchema);
