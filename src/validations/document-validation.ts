// document.zod.ts
import { z } from 'zod';

const personalInfoSchema = z.object({
  _id: z.string().optional(),
  firstName: z.string().max(255).optional(),
  lastName: z.string().max(255).optional(),
  jobTitle: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
});

const educationSchema = z.object({
  _id: z.string().optional(), // ✅ Add _id
  universityName: z.string().max(255).optional(),
  degree: z.string().max(255).optional(),
  major: z.string().max(255).optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const experienceSchema = z.object({
  _id: z.string().optional(), // ✅ Add _id
  title: z.string().max(255).optional(),
  companyName: z.string().max(255).optional(),
  city: z.string().max(255).optional(),
  state: z.string().max(255).optional(),
  currentlyWorking: z.boolean().default(false).optional(),
  workSummary: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const skillsSchema = z.object({
  _id: z.string().optional(), // ✅ Add _id (if not already there)
  name: z.string().max(255).optional(),
  rating: z.number().int().min(0).optional(),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  summary: z.string().optional(),
  themeColor: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z.enum(['archived', 'private', 'public']).default('private').optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['archived', 'private', 'public']).optional(),
  summary: z.string().optional(),
  themeColor: z.string().optional(),
  thumbnail: z.string().optional(),
  personalInfo: personalInfoSchema.optional(),
  experiences: z.array(experienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  skills: z.array(skillsSchema).optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillsSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
