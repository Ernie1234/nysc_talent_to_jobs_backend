/* eslint-disable indent */
import { Types } from 'mongoose';
import { JobModel, IJob, JobStatus } from '@/models/job-model';
import { CreateJobInput, UpdateJobInput, JobQueryInput } from '@/validations/job-validation';
import { NotFoundException } from '@/utils/app-error';
import { UserModel } from '@/models/user-model';
import { ApplicantModel } from '@/models/applicant-model';

export interface JobWithEmployer extends IJob {
  employerDetails?: {
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    companySize?: string;
    industry?: string;
    companyDescription?: string;
    website?: string;
    location?: string;
  };
}

export const createJobService = async (employerId: string, data: CreateJobInput): Promise<IJob> => {
  const jobData = {
    ...data,
    employerId: new Types.ObjectId(employerId),
  };

  const job = await JobModel.create(jobData);
  return job;
};

export const updateJobService = async (
  jobId: string,
  employerId: string,
  data: UpdateJobInput
): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    employerId: new Types.ObjectId(employerId),
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  Object.assign(job, data);
  await job.save();

  return job;
};

export const getJobService = async (jobId: string, employerId: string): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    employerId: new Types.ObjectId(employerId),
  })
    .populate('employerId', 'firstName lastName email employerProfile')
    .populate({
      path: 'applicants',
      populate: {
        path: 'userId',
        select: 'firstName lastName email profile',
      },
    });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  return job;
};
export const getEmployerJobsService = async (
  employerId: string,
  query: JobQueryInput
): Promise<{
  jobs: IJob[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { status, page, limit, search, jobType, experienceLevel, workLocation } = query;

  const filter: any = { employerId: new Types.ObjectId(employerId) };

  if (status) filter.status = status;
  if (jobType) filter.jobType = jobType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (workLocation) filter.workLocation = workLocation;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { aboutJob: { $regex: search, $options: 'i' } },
      { requirements: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Get employer details separately
  const employer = await UserModel.findById(employerId)
    .select('firstName lastName email employerProfile')
    .lean();

  if (!employer) {
    throw new NotFoundException('Employer not found');
  }

  const total = await JobModel.countDocuments(filter);
  const jobs = await JobModel.find(filter)
    .populate('employerId', 'firstName lastName email employerProfile role')
    .populate({
      path: 'applicants',
      populate: {
        path: 'userId',
        select: 'firstName lastName email profile',
      },
      // populate: {
      //   path: 'documentId',
      //   select: 'title',
      // },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const deleteJobService = async (jobId: string, employerId: string): Promise<void> => {
  const result = await JobModel.deleteOne({
    _id: new Types.ObjectId(jobId),
    employerId: new Types.ObjectId(employerId),
  });

  if (result.deletedCount === 0) {
    throw new NotFoundException('Job not found');
  }
};

export const changeJobStatusService = async (
  jobId: string,
  employerId: string,
  status: JobStatus
): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    employerId: new Types.ObjectId(employerId),
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  job.status = status;
  await job.save();

  return job;
};

export const getPublicJobsService = async (
  query: Omit<JobQueryInput, 'status'> & { state?: string }
): Promise<{ jobs: IJob[]; total: number; page: number; totalPages: number }> => {
  const { page, limit, search, jobType, experienceLevel, workLocation, state } = query;

  const filter: any = { status: 'published' };

  if (jobType) filter.jobType = jobType;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (workLocation) filter.workLocation = workLocation;

  if (state) {
    filter.$or = [{ 'hiringLocation.type': 'nation-wide' }, { 'hiringLocation.state': state }];
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { aboutJob: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const total = await JobModel.countDocuments(filter);
  const jobs = await JobModel.find(filter)
    .populate('employerId', 'firstName lastName employerProfile')
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export interface EmployerStats {
  totalJobs: number;
  publishedJobs: number;
  draftedJobs: number;
  closedJobs: number;
  archivedJobs: number;
  totalApplicants: number;
  totalViews: number;
  shortlistedCount: number;
  acceptedCount: number;
  jobs: Array<{
    jobId: string;
    title: string;
    status: string;
    applicationCount: number;
    viewCount: number;
    shortlistedCount: number;
    acceptedCount: number;
    createdAt: Date;
    publishedAt: Date | undefined;
  }>;
}

export const getEmployerAnalysisService = async (employerId: string): Promise<EmployerStats> => {
  const jobs = await JobModel.find({
    employerId: new Types.ObjectId(employerId),
  })
    .select('_id title status applicationCount viewCount createdAt publishedAt')
    .sort({ createdAt: -1 })
    .lean();

  if (!jobs.length) {
    return {
      totalJobs: 0,
      publishedJobs: 0,
      draftedJobs: 0,
      closedJobs: 0,
      archivedJobs: 0,
      totalApplicants: 0,
      totalViews: 0,
      shortlistedCount: 0,
      acceptedCount: 0,
      jobs: [],
    };
  }

  const jobIds = jobs.map(job => job._id);
  const applicantStats = await ApplicantModel.aggregate([
    {
      $match: {
        jobId: { $in: jobIds },
      },
    },
    {
      $group: {
        _id: '$jobId',
        totalApplicants: { $sum: 1 },
        shortlistedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] },
        },
        acceptedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
        },
      },
    },
  ]);

  const applicantStatsMap = new Map();
  applicantStats.forEach(stat => {
    applicantStatsMap.set(stat._id.toString(), {
      totalApplicants: stat.totalApplicants,
      shortlistedCount: stat.shortlistedCount,
      acceptedCount: stat.acceptedCount,
    });
  });

  let totalJobs = 0;
  let publishedJobs = 0;
  let draftedJobs = 0;
  let closedJobs = 0;
  let archivedJobs = 0;
  let totalApplicants = 0;
  let totalViews = 0;
  let totalShortlisted = 0;
  let totalAccepted = 0;

  const jobDetails = jobs.map(job => {
    const jobIdStr = job._id.toString();
    const stats = applicantStatsMap.get(jobIdStr) ?? {
      totalApplicants: 0,
      shortlistedCount: 0,
      acceptedCount: 0,
    };

    // Update overall counts
    totalJobs++;
    totalApplicants += stats.totalApplicants;
    totalViews += job.viewCount || 0;
    totalShortlisted += stats.shortlistedCount;
    totalAccepted += stats.acceptedCount;

    // Update status counts
    switch (job.status) {
      case 'published':
        publishedJobs++;
        break;
      case 'draft':
        draftedJobs++;
        break;
      case 'closed':
        closedJobs++;
        break;
      case 'archived':
        archivedJobs++;
        break;
    }

    return {
      jobId: jobIdStr,
      title: job.title,
      status: job.status,
      applicationCount: stats.totalApplicants,
      viewCount: job.viewCount || 0,
      shortlistedCount: stats.shortlistedCount,
      acceptedCount: stats.acceptedCount,
      createdAt: job.createdAt,
      publishedAt: job.publishedAt,
    };
  });

  return {
    totalJobs,
    publishedJobs,
    draftedJobs,
    closedJobs,
    archivedJobs,
    totalApplicants,
    totalViews,
    shortlistedCount: totalShortlisted,
    acceptedCount: totalAccepted,
    jobs: jobDetails,
  };
};
