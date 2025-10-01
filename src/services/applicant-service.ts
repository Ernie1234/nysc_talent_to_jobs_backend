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
import { calculateAverageProcessingTimes, generateApplicationTrends } from '@/utils/helper';

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
    status: { $ne: 'withdrawn' },
  });

  if (existingApplication && existingApplication.status !== 'withdrawn') {
    throw new BadRequestException('You have already applied to this job');
  }

  // Check if user is a corps member
  const user = await UserModel.findById(userId);
  if (user?.role !== 'interns') {
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
  let applicant;
  const withdrawnApplication = await ApplicantModel.findOne({
    jobId: new Types.ObjectId(jobId),
    userId: new Types.ObjectId(userId),
    status: 'withdrawn',
  });
  if (withdrawnApplication) {
    // Update the withdrawn application
    applicant = await ApplicantModel.findByIdAndUpdate(
      withdrawnApplication._id,
      {
        documentId: data.documentId ? new Types.ObjectId(data.documentId) : undefined,
        resumeUploadId: data.resumeUploadId ? new Types.ObjectId(data.resumeUploadId) : undefined,
        coverLetter: data.coverLetter,
        status: 'pending', // Reset status to pending
        appliedAt: new Date(), // Update application timestamp
        ...data,
      },
      { new: true }
    ); // Only increment application count if this is a new application (not re-applying)
    if (!job.applicants.includes(withdrawnApplication._id)) {
      await JobModel.findByIdAndUpdate(jobId, {
        $push: { applicants: applicant?._id },
        $inc: { applicationCount: 1 },
      });
    }
  } else {
    // Create new application
    applicant = await ApplicantModel.create({
      jobId: new Types.ObjectId(jobId),
      userId: new Types.ObjectId(userId),
      staffId: job.staffId._id,
      documentId: data.documentId ? new Types.ObjectId(data.documentId) : undefined,
      resumeUploadId: data.resumeUploadId ? new Types.ObjectId(data.resumeUploadId) : undefined,
      coverLetter: data.coverLetter,
      status: 'pending',
      ...data,
    });

    // Add applicant to job's applicants array
    await JobModel.findByIdAndUpdate(jobId, {
      $push: { applicants: applicant._id },
      $inc: { applicationCount: 1 },
    });
  }

  const populatedApplicant = await ApplicantModel.findById(applicant?._id)
    .populate('user', 'firstName lastName email profile')
    .populate('resumeDocument')
    .populate('uploadedResume');

  return { applicant: populatedApplicant!, job };
};
export const getStaffJobApplicationsService = async (
  jobId: string,
  staffId: string,
  query: ApplicationQueryInput
): Promise<{ applicants: IApplicant[]; total: number; page: number; totalPages: number }> => {
  // Verify that the staff owns the job
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    staffId: new Types.ObjectId(staffId),
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
export const getStaffApplicationsService = async (
  staffId: string,
  query: ApplicationQueryInput
): Promise<{ applicants: IApplicant[]; total: number; page: number; totalPages: number }> => {
  const { status, page, limit } = query;

  // Validate staffId is a valid ObjectId
  if (!Types.ObjectId.isValid(staffId)) {
    throw new BadRequestException('Invalid staff ID format');
  }

  const filter: any = { staffId: new Types.ObjectId(staffId) };
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
  staffId: string,
  data: UpdateApplicationInput
): Promise<IApplicant> => {
  const applicant = await ApplicantModel.findById(applicationId).populate({
    path: 'jobId',
    match: { staffId: new Types.ObjectId(staffId) },
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
      'title staffId jobType experienceLevel workLocation applicationCount viewCount status hiringLocation salaryRange requirements aboutJob jobPeriod'
    )
    .populate('staff', 'firstName lastName staffProfile') // Populate staff details
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
    .populate('staff', 'firstName lastName email staffProfile')
    .populate('job', 'title requirements aboutJob salaryRange')
    .populate('resumeDocument')
    .populate('uploadedResume');

  if (!applicant) {
    throw new NotFoundException('Application not found');
  }

  // Check permissions: either the applicant (corps member) or the staff
  const isOwner = applicant.userId.toString() === userId;
  const isStaff = userRole === 'staff' && applicant.staffId.toString() === userId;

  if (!isOwner && !isStaff) {
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

export interface staffApplicationAnalysis {
  totalApplications: number;
  applicationStats: {
    pending: number;
    under_review: number;
    shortlisted: number;
    interview: number;
    rejected: number;
    accepted: number;
    withdrawn: number;
  };
  applicationTrends: {
    daily: Array<{
      date: string;
      count: number;
    }>;
    weekly: Array<{
      week: string;
      count: number;
    }>;
    monthly: Array<{
      month: string;
      count: number;
    }>;
  };
  recentApplications: Array<{
    applicationId: string;
    jobId: string;
    jobTitle: string;
    applicantName: string;
    applicantEmail: string;
    status: string;
    appliedAt: Date;
    reviewedAt?: Date;
    coverLetter?: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  averageApplicationTime: {
    appliedToReviewed: number; // in hours
    appliedToAccepted: number; // in hours
  };
}

export const getStaffApplicationAnalysisService = async (
  staffId: string
): Promise<staffApplicationAnalysis> => {
  if (!Types.ObjectId.isValid(staffId)) {
    throw new NotFoundException('staff not found');
  }

  // Get all applications for this staff
  const applications = await ApplicantModel.find({
    staffId: new Types.ObjectId(staffId),
  })
    .populate('userId', 'firstName lastName email')
    .populate('jobId', 'title')
    .sort({ appliedAt: -1 })
    .lean();

  if (!applications.length) {
    return {
      totalApplications: 0,
      applicationStats: {
        pending: 0,
        under_review: 0,
        shortlisted: 0,
        interview: 0,
        rejected: 0,
        accepted: 0,
        withdrawn: 0,
      },
      applicationTrends: {
        daily: [],
        weekly: [],
        monthly: [],
      },
      recentApplications: [],
      statusDistribution: [],
      averageApplicationTime: {
        appliedToReviewed: 0,
        appliedToAccepted: 0,
      },
    };
  }

  // Calculate application statistics with type safety
  const applicationStats = {
    pending: 0,
    under_review: 0,
    shortlisted: 0,
    interview: 0,
    rejected: 0,
    accepted: 0,
    withdrawn: 0,
  };

  applications.forEach(app => {
    const status = app.status as keyof typeof applicationStats;
    if (Object.prototype.hasOwnProperty.call(applicationStats, status)) {
      applicationStats[status]++;
    }
  });

  const totalApplications = applications.length;
  const statusDistribution = Object.entries(applicationStats).map(([status, count]) => ({
    status,
    count,
    percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
  }));

  // Generate application trends
  const applicationTrends = generateApplicationTrends(applications);

  // Get recent applications (last 10) with type safety
  // Alternative approach with type assertions
  const recentApplications = applications.slice(0, 10).map(app => {
    const populatedJob = app.jobId as any;
    const populatedUser = app.userId as any;

    return {
      applicationId: app._id.toString(),
      jobId: populatedJob?._id?.toString() ?? '',
      jobTitle: populatedJob?.title ?? 'Unknown Job',
      applicantName:
        `${populatedUser?.firstName ?? ''} ${populatedUser?.lastName ?? ''}`.trim() ||
        'Unknown Applicant',
      applicantEmail: populatedUser?.email ?? 'No email',
      status: app.status,
      appliedAt: app.appliedAt,
      reviewedAt: app.reviewedAt as Date | undefined, // Type assertion
      coverLetter: app.coverLetter as string | undefined, // Type assertion
    };
  }) as Array<{
    applicationId: string;
    jobId: string;
    jobTitle: string;
    applicantName: string;
    applicantEmail: string;
    status: string;
    appliedAt: Date;
    reviewedAt?: Date;
    coverLetter?: string;
  }>;

  // Calculate average application processing times
  const averageApplicationTime = calculateAverageProcessingTimes(applications);

  return {
    totalApplications,
    applicationStats,
    applicationTrends,
    recentApplications,
    statusDistribution,
    averageApplicationTime,
  };
};
