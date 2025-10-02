import { Schema, model, Document, Types } from 'mongoose';

// Enums for course-related fields
export const courseLevelEnum = ['beginner', 'intermediate', 'advanced'] as const;
export const courseStatusEnum = ['draft', 'published', 'archived'] as const;
export const attendanceStatusEnum = ['present', 'absent', 'late'] as const;

export type CourseLevel = (typeof courseLevelEnum)[number];
export type CourseStatus = (typeof courseStatusEnum)[number];
export type AttendanceStatus = (typeof attendanceStatusEnum)[number];

// QR Code Session interface
export interface IQrSession {
  _id: Types.ObjectId;
  sessionCode: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

// Attendance record interface
export interface IAttendance {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  status: AttendanceStatus;
  scannedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Course interface
export interface ICourse extends Document {
  _id: Types.ObjectId;
  staffId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number; // in hours
  maxStudents: number;
  skills: string[];
  prerequisites: string[];
  learningObjectives: string[];
  status: CourseStatus;
  coverImage?: string;
  enrolledStudents: Types.ObjectId[];
  qrSessions: Types.ObjectId[];
  totalSessions: number;
  attendanceRate: number; // percentage
  isActive: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// QR Session schema
const qrSessionSchema = new Schema<IQrSession>(
  {
    sessionCode: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Attendance schema
const attendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'QrSession',
      required: true,
    },
    status: {
      type: String,
      enum: attendanceStatusEnum,
      default: 'present',
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Course schema
const courseSchema = new Schema<ICourse>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Course title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Course description cannot exceed 2000 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Course duration is required'],
      min: [1, 'Duration must be at least 1 hour'],
    },
    prerequisites: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Prerequisite cannot exceed 200 characters'],
      },
    ],
    learningObjectives: [
      {
        type: String,
        trim: true,
        maxlength: [200, 'Learning objective cannot exceed 200 characters'],
      },
    ],
    status: {
      type: String,
      enum: courseStatusEnum,
      default: 'published',
    },
    coverImage: { type: String, required: false },
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    qrSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'QrSession',
      },
    ],
    totalSessions: {
      type: Number,
      default: 0,
    },
    attendanceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: Date,
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
courseSchema.index({ staffId: 1, status: 1 });
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ enrolledStudents: 1 });

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount').get(function (this: ICourse) {
  return this.enrolledStudents.length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function (this: ICourse) {
  return this.maxStudents - this.enrolledStudents.length;
});

// Pre-save middleware to handle publishedAt
courseSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const CourseModel = model<ICourse>('Course', courseSchema);
export const QrSessionModel = model<IQrSession>('QrSession', qrSessionSchema);
export const AttendanceModel = model<IAttendance>('Attendance', attendanceSchema);
