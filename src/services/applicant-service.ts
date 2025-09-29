/* eslint-disable max-len */
// services/applicant-service.ts
import { Types } from 'mongoose';
import { ApplicantModel, IApplicant } from '@/models/applicant-model';
import { JobModel } from '@/models/job-model';
import { UserModel } from '@/models/user-model';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@/utils/app-error';
import {
  ApplicationQueryInput,
  ApplyToJobInput,
  UpdateApplicationInput,
} from '@/validations/applicant-validation';
import { DocumentModel } from '@/models/document-model';
import { ResumeUploadModel } from '@/models/resume-upload-model';

export const applyToJobService = async (
  jobId: string,
  userId: string,
  data: ApplyToJobInput
): Promise<{ applicant: IApplicant; job: any }> => {
  // Check if job exists and is published
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    status: 'published',
  });

  if (!job) {
    throw new NotFoundException('Job not found or not published');
  }

  // Check if user has already applied
  const existingApplication = await ApplicantModel.findOne({
    jobId: new Types.ObjectId(jobId),
    userId: new Types.ObjectId(userId),
  });

  if (existingApplication) {
    throw new BadRequestException('You have already applied to this job');
  }

  // Check if user is a corps member
  const user = await UserModel.findById(userId);
  if (user?.role !== 'corps_member') {
    throw new UnauthorizedException('Only corps members can apply to jobs');
  }

  // Validate document/resume ownership if provided
  if (data.documentId) {
    const document = await DocumentModel.findOne({
      _id: new Types.ObjectId(data.documentId),
      userId: new Types.ObjectId(userId),
    });
    if (!document) {
      throw new BadRequestException('Document not found or you do not own this document');
    }
  }

  if (data.resumeUploadId) {
    const resumeUpload = await ResumeUploadModel.findOne({
      _id: new Types.ObjectId(data.resumeUploadId),
      userId: new Types.ObjectId(userId),
    });
    if (!resumeUpload) {
      throw new BadRequestException('Resume upload not found or you do not own this resume');
    }
  }

  // Create application
  const applicant = await ApplicantModel.create({
    jobId: new Types.ObjectId(jobId),
    userId: new Types.ObjectId(userId),
    employerId: job.employerId._id,
    documentId: data.documentId ? new Types.ObjectId(data.documentId) : undefined,
    resumeUploadId: data.resumeUploadId ? new Types.ObjectId(data.resumeUploadId) : undefined,
    coverLetter: data.coverLetter,
    ...data,
  });

  // Add applicant to job's applicants array
  await JobModel.findByIdAndUpdate(jobId, {
    $push: { applicants: applicant._id },
    $inc: { applicationCount: 1 },
  });

  const populatedApplicant = await ApplicantModel.findById(applicant._id)
    .populate('user', 'firstName lastName email profile')
    .populate('resumeDocument')
    .populate('uploadedResume');

  return { applicant: populatedApplicant!, job };
};

export const getJobApplicationsService = async (
  jobId: string,
  employerId: string,
  query: ApplicationQueryInput
): Promise<{ applicants: IApplicant[]; total: number; page: number; totalPages: number }> => {
  // Verify that the employer owns the job
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    employerId: new Types.ObjectId(employerId),
  });

  if (!job) {
    throw new NotFoundException('Job not found or you do not have permission to view applications');
  }

  const { status, page, limit } = query;

  const filter: any = { jobId: new Types.ObjectId(jobId) };
  if (status) filter.status = status;

  const total = await ApplicantModel.countDocuments(filter);
  const applicants = await ApplicantModel.find(filter)
    .populate('user', 'firstName lastName email profile')
    .populate('resumeDocument')
    .populate('uploadedResume')
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    applicants,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getEmployerApplicationsService = async (
  employerId: string,
  query: ApplicationQueryInput
): Promise<{ applicants: IApplicant[]; total: number; page: number; totalPages: number }> => {
  const { status, page, limit } = query;

  // Validate employerId is a valid ObjectId
  if (!Types.ObjectId.isValid(employerId)) {
    throw new BadRequestException('Invalid employer ID format');
  }

  const filter: any = { employerId: new Types.ObjectId(employerId) };
  if (status) filter.status = status;

  const total = await ApplicantModel.countDocuments(filter);
  const applicants = await ApplicantModel.find(filter)
    .populate('user', 'firstName lastName email profile')
    .populate('job', 'title jobType experienceLevel')
    .populate('resumeDocument')
    .populate('uploadedResume')
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    applicants,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
export const updateApplicationService = async (
  applicationId: string,
  employerId: string,
  data: UpdateApplicationInput
): Promise<IApplicant> => {
  const applicant = await ApplicantModel.findById(applicationId).populate({
    path: 'jobId',
    match: { employerId: new Types.ObjectId(employerId) },
  });

  if (!applicant || !applicant.jobId) {
    throw new NotFoundException('Application not found or you do not have permission to update it');
  }

  const updateData: any = { ...data };
  if (data.status && data.status !== applicant.status) {
    updateData.reviewedAt = new Date();
  }

  const updatedApplicant = await ApplicantModel.findByIdAndUpdate(applicationId, updateData, {
    new: true,
  }).populate('userId', 'firstName lastName email profile');

  if (!updatedApplicant) {
    throw new NotFoundException('Application not found');
  }

  return updatedApplicant;
};

export const getUserApplicationsService = async (
  userId: string,
  query: ApplicationQueryInput
): Promise<{ applications: IApplicant[]; total: number; page: number; totalPages: number }> => {
  const { status, page, limit } = query;

  const filter: any = { userId: new Types.ObjectId(userId) };
  if (status) filter.status = status;

  const total = await ApplicantModel.countDocuments(filter);
  const applications = await ApplicantModel.find(filter)
    .populate(
      'job',
      'title employerId jobType experienceLevel workLocation applicationCount viewCount status hiringLocation salaryRange requirements aboutJob jobPeriod'
    )
    .populate('employer', 'firstName lastName employerProfile') // Populate employer details
    .populate('resumeDocument')
    .populate('uploadedResume')
    .sort({ appliedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    applications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getApplicationDetailsService = async (
  applicationId: string,
  userId: string,
  userRole: string
): Promise<IApplicant> => {
  const applicant = await ApplicantModel.findById(applicationId)
    .populate('user', 'firstName lastName email profile')
    .populate('employer', 'firstName lastName email employerProfile')
    .populate('job', 'title requirements aboutJob salaryRange')
    .populate('resumeDocument')
    .populate('uploadedResume');

  if (!applicant) {
    throw new NotFoundException('Application not found');
  }

  // Check permissions: either the applicant (corps member) or the employer
  const isOwner = applicant.userId.toString() === userId;
  const isEmployer = userRole === 'employer' && applicant.employerId.toString() === userId;

  if (!isOwner && !isEmployer) {
    throw new UnauthorizedException('You do not have permission to view this application');
  }

  return applicant;
};
export const withdrawApplicationService = async (
  applicationId: string,
  userId: string
): Promise<void> => {
  const applicant = await ApplicantModel.findOne({
    _id: new Types.ObjectId(applicationId),
    userId: new Types.ObjectId(userId),
  });

  if (!applicant) {
    throw new NotFoundException('Application not found');
  }

  if (applicant.status === 'withdrawn') {
    throw new BadRequestException('Application already withdrawn');
  }

  applicant.status = 'withdrawn';
  await applicant.save();

  // Update job application count
  await JobModel.findByIdAndUpdate(applicant.jobId, {
    $inc: { applicationCount: -1 },
  });
};
