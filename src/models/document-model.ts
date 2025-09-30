// document.model.ts

import { Schema, model, Document, Types } from 'mongoose';

// Define enums for document status
export const statusEnum = ['archived', 'private', 'public'] as const;
type DocumentStatus = (typeof statusEnum)[number];

// Interfaces for sub-documents
export interface IPersonalInfo extends Document {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface IEducation extends Document {
  _id: Types.ObjectId;
  universityName?: string;
  degree?: string;
  major?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IExperience extends Document {
  _id: Types.ObjectId;
  title?: string;
  companyName?: string;
  city?: string;
  state?: string;
  currentlyWorking?: boolean;
  workSummary?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ISkill extends Document {
  _id: Types.ObjectId;
  name?: string;
  rating?: number;
}

export interface IDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  documentId: string;
  title: string;
  summary?: string;
  themeColor: string;
  thumbnail?: string;
  currentPosition: number;
  status: DocumentStatus;
  authorName: string;
  authorEmail: string;
  personalInfo?: Types.ObjectId | IPersonalInfo;
  experiences: Types.ObjectId[] | IExperience[];
  educations: Types.ObjectId[] | IEducation[];
  skills: Types.ObjectId[] | ISkill[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Mongoose Schemas

const personalInfoSchema = new Schema<IPersonalInfo>(
  {
    firstName: { type: String, trim: true, maxlength: 255 },
    lastName: { type: String, trim: true, maxlength: 255 },
    jobTitle: { type: String, trim: true, maxlength: 255 },
    address: { type: String, trim: true, maxlength: 500 },
    phone: { type: String, trim: true, maxlength: 50 },
    email: { type: String, trim: true, maxlength: 255 },
  },
  { _id: true, timestamps: false }
); // Disable _id for this sub-schema if embedding, but we'll use a separate collection

const educationSchema = new Schema<IEducation>(
  {
    universityName: { type: String, trim: true, maxlength: 255 },
    degree: { type: String, trim: true, maxlength: 255 },
    major: { type: String, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: false }
);

const experienceSchema = new Schema<IExperience>(
  {
    title: { type: String, trim: true, maxlength: 255 },
    companyName: { type: String, trim: true, maxlength: 255 },
    city: { type: String, trim: true, maxlength: 255 },
    state: { type: String, trim: true, maxlength: 255 },
    currentlyWorking: { type: Boolean, default: false },
    workSummary: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: true, timestamps: false }
);

const skillsSchema = new Schema<ISkill>(
  {
    name: { type: String, trim: true, maxlength: 255 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: false }
);

const documentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: String, unique: true, required: true },
    title: { type: String, required: true, maxlength: 255 },
    summary: { type: String },
    themeColor: { type: String, required: true, default: '#7c3aed' },
    thumbnail: { type: String },
    currentPosition: { type: Number, required: true, default: 1 },
    status: { type: String, enum: statusEnum, required: true, default: 'private' },
    authorName: { type: String, required: true, maxlength: 255 },
    authorEmail: { type: String, required: true, maxlength: 255 },
    personalInfo: { type: Schema.Types.ObjectId, ref: 'PersonalInfo' },
    experiences: [{ type: Schema.Types.ObjectId, ref: 'Experience' }],
    educations: [{ type: Schema.Types.ObjectId, ref: 'Education' }],
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
  },
  {
    timestamps: true,
  }
);

// Models
export const PersonalInfoModel = model<IPersonalInfo>('PersonalInfo', personalInfoSchema);
export const EducationModel = model<IEducation>('Education', educationSchema);
export const ExperienceModel = model<IExperience>('Experience', experienceSchema);
export const SkillsModel = model<ISkill>('Skill', skillsSchema);
export const DocumentModel = model<IDocument>('Document', documentSchema);
