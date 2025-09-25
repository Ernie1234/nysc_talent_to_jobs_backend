import { Types } from 'mongoose';
import {
  DocumentModel,
  EducationModel,
  ExperienceModel,
  IDocument,
  PersonalInfoModel,
  SkillsModel,
} from '@/models/document-model';
import {
  CreateDocumentInput,
  EducationInput,
  ExperienceInput,
  PersonalInfoInput,
  SkillInput,
  UpdateDocumentInput,
} from '@/validations/document-validation';
import { NotFoundException } from '@/utils/app-error';
import { generateDocUUID } from '@/utils/helper';

/**
 * Creates a new document.
 */
export const createDocumentService = async (
  userId: string,
  authorName: string,
  authorEmail: string,
  data: CreateDocumentInput
): Promise<IDocument> => {
  const newDocument = await DocumentModel.create({
    ...data,
    userId: new Types.ObjectId(userId),
    authorName,
    authorEmail,
    documentId: generateDocUUID(), // Assumed to be available
  });
  return newDocument;
};

/**
 * Updates a document and its sub-documents.
 */
export const updateDocumentService = async (
  documentId: string | undefined,
  userId: string,
  updateData: UpdateDocumentInput
): Promise<IDocument> => {
  const { personalInfo, experiences, educations, skills, ...docUpdates } = updateData;

  const existingDocument = await DocumentModel.findOne({
    userId: new Types.ObjectId(userId),
    documentId,
  });

  if (!existingDocument) {
    throw new NotFoundException('Document not found');
  }

  // Update the main document fields
  Object.assign(existingDocument, docUpdates);
  await existingDocument.save();

  // Handle personal info with proper typing
  if (personalInfo) {
    const personalInfoData = personalInfo as PersonalInfoInput;

    if (existingDocument.personalInfo) {
      await PersonalInfoModel.findByIdAndUpdate(
        existingDocument.personalInfo,
        { $set: personalInfoData },
        { new: true }
      );
    } else {
      const newPersonalInfo = await PersonalInfoModel.create(personalInfoData);
      existingDocument.personalInfo = newPersonalInfo._id;
      await existingDocument.save();
    }
  }

  // Handle experiences with proper typing
  if (experiences && Array.isArray(experiences)) {
    const experienceData = experiences as ExperienceInput[];
    const incomingExperienceIds = new Set(
      experienceData.map(exp => exp._id?.toString()).filter(Boolean)
    );
    const existingExperienceIds = existingDocument.experiences || [];

    const experiencesToDelete = existingExperienceIds.filter(
      id => !incomingExperienceIds.has(id.toString())
    );
    await ExperienceModel.deleteMany({ _id: { $in: experiencesToDelete } });

    const newExperienceIds = [];
    for (const exp of experienceData) {
      if (exp._id) {
        await ExperienceModel.findByIdAndUpdate(exp._id, exp, { new: true });
        newExperienceIds.push(new Types.ObjectId(exp._id));
      } else {
        const newExperience = await ExperienceModel.create(exp);
        newExperienceIds.push(newExperience._id);
      }
    }
    existingDocument.experiences = newExperienceIds;
    await existingDocument.save();
  }

  // Handle educations with proper typing
  if (educations && Array.isArray(educations)) {
    const educationData = educations as EducationInput[];
    const incomingEducationIds = new Set(
      educationData.map(edu => edu._id?.toString()).filter(Boolean)
    );
    const existingEducationIds = existingDocument.educations || [];

    const educationToDelete = existingEducationIds.filter(
      id => !incomingEducationIds.has(id.toString())
    );
    await EducationModel.deleteMany({ _id: { $in: educationToDelete } });

    const newEducationIds = [];
    for (const edu of educationData) {
      if (edu._id) {
        await EducationModel.findByIdAndUpdate(edu._id, edu, { new: true });
        newEducationIds.push(new Types.ObjectId(edu._id));
      } else {
        const newEducation = await EducationModel.create(edu);
        newEducationIds.push(newEducation._id);
      }
    }
    existingDocument.educations = newEducationIds;
    await existingDocument.save();
  }

  // Handle skills with proper typing
  if (skills && Array.isArray(skills)) {
    const skillData = skills as SkillInput[];
    const incomingSkillIds = new Set(skillData.map(skill => skill._id?.toString()).filter(Boolean));
    const existingSkillIds = existingDocument.skills || [];

    const skillsToDelete = existingSkillIds.filter(id => !incomingSkillIds.has(id.toString()));
    await SkillsModel.deleteMany({ _id: { $in: skillsToDelete } });

    const newSkillIds = [];
    for (const skill of skillData) {
      if (skill._id) {
        await SkillsModel.findByIdAndUpdate(skill._id, skill, { new: true });
        newSkillIds.push(new Types.ObjectId(skill._id));
      } else {
        const newSkill = await SkillsModel.create(skill);
        newSkillIds.push(newSkill._id);
      }
    }
    existingDocument.skills = newSkillIds;
    await existingDocument.save();
  }

  return existingDocument;
};

/**
 * Restores a document from archive.
 */
export const restoreArchiveService = async (
  documentId: string,
  userId: string
): Promise<IDocument> => {
  const document = await DocumentModel.findOneAndUpdate(
    { documentId, userId: new Types.ObjectId(userId), status: 'archived' },
    { status: 'private' },
    { new: true }
  );

  if (!document) {
    throw new NotFoundException('Document not found or not in archive');
  }

  return document;
};

/**
 * Fetches all non-archived documents for a user.
 */
export const getDocumentsService = async (userId: string): Promise<IDocument[]> => {
  const documents = await DocumentModel.find({
    userId: new Types.ObjectId(userId),
    status: { $ne: 'archived' },
  }).sort({ updatedAt: -1 });

  return documents;
};

/**
 * Fetches a single document for a user.
 */
export const getSingleDocumentService = async (
  documentId: string,
  userId: string
): Promise<IDocument> => {
  console.log(` Fetching document with ID: ${documentId} for user: ${userId} `);

  const document = await DocumentModel.findOne({
    userId: new Types.ObjectId(userId),
    documentId,
  })
    .populate('personalInfo')
    .populate('experiences')
    .populate('educations')
    .populate('skills');

  if (!document) {
    throw new NotFoundException('Document not found');
  }

  return document;
};

/**
 * Fetches a public document.
 */
export const getPublicDocumentService = async (documentId: string): Promise<IDocument> => {
  const document = await DocumentModel.findOne({
    documentId,
    status: 'public',
  })
    .populate('personalInfo')
    .populate('experiences')
    .populate('educations')
    .populate('skills');

  if (!document) {
    throw new NotFoundException('Document not found or is not public');
  }

  return document;
};

/**
 * Fetches all archived documents for a user.
 */
export const getArchivedDocumentsService = async (userId: string): Promise<IDocument[]> => {
  const documents = await DocumentModel.find({
    userId: new Types.ObjectId(userId),
    status: 'archived',
  });

  return documents;
};
