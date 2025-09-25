// models/ResumeUpload.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IResumeUpload extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  uploadDate: Date;
  status: 'uploading' | 'completed' | 'error' | 'processing';
  parsedData?: {
    skills?: string[];
    experience?: any[];
    education?: any[];
    personalInfo?: any;
  };
}

const resumeUploadSchema = new Schema<IResumeUpload>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'doc', 'docx', 'txt'],
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['uploading', 'completed', 'error', 'processing'],
      default: 'uploading',
    },
    parsedData: {
      skills: [String],
      experience: [Object],
      education: [Object],
      personalInfo: Object,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any): any => {
        delete ret.filePath; // Don't expose file path in responses
        return ret;
      },
    },
  }
);

// Index for faster queries
resumeUploadSchema.index({ userId: 1 });
resumeUploadSchema.index({ uploadDate: -1 });

export const ResumeUploadModel = model<IResumeUpload>('ResumeUpload', resumeUploadSchema);
