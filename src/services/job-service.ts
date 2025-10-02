/* eslint-disable indent */
import { Types } from 'mongoose';
import { JobModel, IJob, JobStatus } from '@/models/job-model';
import { CreateJobInput, UpdateJobInput, JobQueryInput } from '@/validations/job-validation';
import { NotFoundException } from '@/utils/app-error';
import { UserModel } from '@/models/user-model';
import { ApplicantModel } from '@/models/applicant-model';

export interface JobWithStaff extends IJob {
  staffDetails?: {
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

export const createJobService = async (staffId: string, data: CreateJobInput): Promise<IJob> => {
  const staff = await UserModel.findById(staffId).select('role');

  const jobData = {
    ...data,
    staffId: new Types.ObjectId(staffId),
    isNitda: staff?.role === 'ADMIN' || staff?.role === 'STAFF',
  };

  const job = await JobModel.create(jobData);
  return job;
};

export const updateJobService = async (
  jobId: string,
  staffId: string,
  data: UpdateJobInput
): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    staffId: new Types.ObjectId(staffId),
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  Object.assign(job, data);
  await job.save();

  return job;
};

export const getJobService = async (jobId: string, staffId: string): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    staffId: new Types.ObjectId(staffId),
  })
    .populate('staffId', 'firstName lastName email staffProfile')
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
export const getStaffJobsService = async (
  staffId: string,
  query: JobQueryInput
): Promise<{
  jobs: IJob[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { status, page, limit, search, jobType, experienceLevel, workLocation } = query;

  const filter: any = { staffId: new Types.ObjectId(staffId) };

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

  // Get staff details separately
  const staff = await UserModel.findById(staffId)
    .select('firstName lastName email staffProfile')
    .lean();

  if (!staff) {
    throw new NotFoundException('staff not found');
  }

  const total = await JobModel.countDocuments(filter);
  const jobs = await JobModel.find(filter)
    .populate('staffId', 'firstName lastName email staffProfile role')
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

export const deleteJobService = async (jobId: string, staffId: string): Promise<void> => {
  const result = await JobModel.deleteOne({
    _id: new Types.ObjectId(jobId),
    staffId: new Types.ObjectId(staffId),
  });

  if (result.deletedCount === 0) {
    throw new NotFoundException('Job not found');
  }
};

export const changeJobStatusService = async (
  jobId: string,
  staffId: string,
  status: JobStatus
): Promise<IJob> => {
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    staffId: new Types.ObjectId(staffId),
  });

  if (!job) {
    throw new NotFoundException('Job not found');
  }

  job.status = status;
  await job.save();

  return job;
};
export interface staffStats {
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

export const getStaffAnalysisService = async (staffId: string): Promise<staffStats> => {
  const jobs = await JobModel.find({
    staffId: new Types.ObjectId(staffId),
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
export const getPublicJobsService = async (
  query: JobQueryInput
): Promise<{
  jobs: IJob[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { page, limit, search, jobType, experienceLevel, workLocation } = query;

  // Corps members can only see published jobs
  const filter: any = { status: 'published' };

  // Additional filters
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

  const total = await JobModel.countDocuments(filter);
  const jobs = await JobModel.find(filter)
    .populate('staffId', 'firstName lastName email staffProfile companyName')
    .select('-applicants') // Don't include applicants data for corps members
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
export const getPublicJobDetailsService = async (jobId: string): Promise<IJob> => {
  // Validate job exists and is published
  const job = await JobModel.findOne({
    _id: new Types.ObjectId(jobId),
    status: 'published',
  })
    .populate('staffId', 'firstName lastName email staffProfile companyName')
    .select('-applicants') // Don't include applicants data
    .lean();

  if (!job) {
    throw new NotFoundException('Job not found or not published ⛔');
  }

  return job;
};
export const updateJobViewCountService = async (jobId: string): Promise<IJob> => {
  // Use findOneAndUpdate for atomic increment
  const job = await JobModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(jobId),
      status: 'published',
    },
    {
      $inc: { viewCount: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('staffId', 'firstName lastName email staffProfile companyName')
    .select('-applicants') // Don't include applicants data
    .lean();

  if (!job) {
    throw new NotFoundException('Job not found or not published ⛔');
  }

  return job as IJob;
};
