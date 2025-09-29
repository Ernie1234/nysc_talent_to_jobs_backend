import { Types } from 'mongoose';
import { JobModel, IJob, JobStatus } from '@/models/job-model';
import { CreateJobInput, UpdateJobInput, JobQueryInput } from '@/validations/job-validation';
import { NotFoundException } from '@/utils/app-error';
import { UserModel } from '@/models/user-model';

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
