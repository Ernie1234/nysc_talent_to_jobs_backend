/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
// services/admin-service.ts
import { ApplicantModel, IApplicant } from '@/models/applicant-model';
import { UserModel, IUser } from '@/models/user-model';
import { JobModel } from '@/models/job-model';
import { CourseModel } from '@/models/course-model';
import { NotFoundException, BadRequestException } from '@/utils/app-error';
import { ApplicationQuerySchemaType, UserQuerySchemaType } from '@/validations/admin-validation';

// Application Management
export const getAllApplicationsService = async (
  query: ApplicationQuerySchemaType
): Promise<{
  applications: IApplicant[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { status, role, page, limit, search, startDate, endDate } = query;

  const filter: any = {};

  if (status) filter.status = status;

  // Filter by user role if specified
  if (role) {
    const users = await UserModel.find({ role }).select('_id');
    const userIds = users.map(user => user._id);
    filter.userId = { $in: userIds };
  }

  // Date range filter
  if (startDate || endDate) {
    filter.appliedAt = {};
    if (startDate) filter.appliedAt.$gte = new Date(startDate);
    if (endDate) filter.appliedAt.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    const users = await UserModel.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    const userIds = users.map(user => user._id);

    const jobs = await JobModel.find({
      title: { $regex: search, $options: 'i' },
    }).select('_id');
    const jobIds = jobs.map(job => job._id);

    filter.$or = [{ userId: { $in: userIds } }, { jobId: { $in: jobIds } }];
  }

  const total = await ApplicantModel.countDocuments(filter);
  const applications = await ApplicantModel.find(filter)
    .populate('userId', 'firstName lastName email profile role')
    .populate('jobId', 'title staffId jobType experienceLevel workLocation')
    .populate('staffId', 'firstName lastName email staffProfile')
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

export const updateApplicationStatusService = async (
  applicationId: string,
  status: string
): Promise<IApplicant> => {
  const application = await ApplicantModel.findById(applicationId);

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  const updateData: any = { status };
  if (status !== application.status) {
    updateData.reviewedAt = new Date();
  }

  const updatedApplication = await ApplicantModel.findByIdAndUpdate(applicationId, updateData, {
    new: true,
  })
    .populate('userId', 'firstName lastName email profile role')
    .populate('jobId', 'title staffId')
    .populate('staffId', 'firstName lastName email');

  if (!updatedApplication) {
    throw new NotFoundException('Application not found after update');
  }

  return updatedApplication;
};

// User Management
export const getAllUsersService = async (
  query: UserQuerySchemaType
): Promise<{
  users: IUser[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { role, status, page, limit, search } = query;

  const filter: any = {};

  if (role) filter.role = role;

  // Fix: Handle status filter properly for users with and without profiles
  if (status) {
    filter.$or = [
      { 'profile.status': status },
      // Include users without profile but with the status in profile field
      { profile: { $exists: true, $ne: null }, 'profile.status': status },
    ];
  }

  if (search) {
    const searchFilter = {
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.stateCode': { $regex: search, $options: 'i' } },
        { 'profile.callUpNumber': { $regex: search, $options: 'i' } },
      ],
    };

    // Combine with existing filter
    filter.$and = filter.$and ? [...filter.$and, searchFilter] : [searchFilter];
  }

  const total = await UserModel.countDocuments(filter);
  const users = await UserModel.find(filter)
    .select('-password -passwordResetToken -emailVerificationToken')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateUserStatusService = async (userId: string, status: string): Promise<IUser> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Only allow status updates for CORPS_MEMBER and SIWES
  if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
    throw new BadRequestException('Can only update status for CORPS_MEMBER and SIWES users');
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { 'profile.status': status },
    { new: true }
  ).select('-password -passwordResetToken -emailVerificationToken');

  if (!updatedUser) {
    throw new NotFoundException('User not found after update');
  }

  return updatedUser;
};

// Dashboard Stats
export interface AdminDashboardStats {
  totalUsers: number;
  userStats: {
    CORPS_MEMBER: number;
    SIWES: number;
    STAFF: number;
    ADMIN: number;
  };
  userStatusStats: {
    ACCEPTED: number;
    REJECTED: number;
    SUSPENDED: number;
    PENDING: number;
  };
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
  totalCourses: number;
  courseStats: {
    draft: number;
    published: number;
    archived: number;
  };
  totalJobs: number;
  recentActivities: Array<{
    type: 'user_registered' | 'application_submitted' | 'course_created' | 'job_created';
    description: string;
    timestamp: Date;
    userId: string;
    userName: string;
  }>;
}

export const getAdminDashboardStatsService = async (): Promise<AdminDashboardStats> => {
  // User statistics
  const totalUsers = await UserModel.countDocuments();
  const userStats = {
    CORPS_MEMBER: await UserModel.countDocuments({ role: 'CORPS_MEMBER' }),
    SIWES: await UserModel.countDocuments({ role: 'SIWES' }),
    STAFF: await UserModel.countDocuments({ role: 'STAFF' }),
    ADMIN: await UserModel.countDocuments({ role: 'ADMIN' }),
  };

  // User status statistics
  const userStatusStats = {
    ACCEPTED: await UserModel.countDocuments({ 'profile.status': 'ACCEPTED' }),
    REJECTED: await UserModel.countDocuments({ 'profile.status': 'REJECTED' }),
    SUSPENDED: await UserModel.countDocuments({ 'profile.status': 'SUSPENDED' }),
    PENDING: await UserModel.countDocuments({ 'profile.status': 'PENDING' }),
  };

  // Application statistics
  const totalApplications = await ApplicantModel.countDocuments();
  const applicationStats = {
    pending: await ApplicantModel.countDocuments({ status: 'pending' }),
    under_review: await ApplicantModel.countDocuments({ status: 'under_review' }),
    shortlisted: await ApplicantModel.countDocuments({ status: 'shortlisted' }),
    interview: await ApplicantModel.countDocuments({ status: 'interview' }),
    rejected: await ApplicantModel.countDocuments({ status: 'rejected' }),
    accepted: await ApplicantModel.countDocuments({ status: 'accepted' }),
    withdrawn: await ApplicantModel.countDocuments({ status: 'withdrawn' }),
  };

  // Course statistics
  const totalCourses = await CourseModel.countDocuments();
  const courseStats = {
    draft: await CourseModel.countDocuments({ status: 'draft' }),
    published: await CourseModel.countDocuments({ status: 'published' }),
    archived: await CourseModel.countDocuments({ status: 'archived' }),
  };

  // Job statistics
  const totalJobs = await JobModel.countDocuments();

  // Recent activities (last 10 activities)
  const recentUsers = await UserModel.find()
    .select('firstName lastName role createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentApplications = await ApplicantModel.find()
    .populate('userId', 'firstName lastName')
    .sort({ appliedAt: -1 })
    .limit(5)
    .lean();

  const recentActivities = [
    ...recentUsers.map(user => ({
      type: 'user_registered' as const,
      description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
      timestamp: user.createdAt,
      userId: user._id.toString(),
      userName: `${user.firstName} ${user.lastName}`,
    })),
    ...recentApplications.map(app => ({
      type: 'application_submitted' as const,
      description: `Application submitted by ${(app.userId as any).firstName} ${(app.userId as any).lastName}`,
      timestamp: app.appliedAt,
      userId: (app.userId as any)._id.toString(),
      userName: `${(app.userId as any).firstName} ${(app.userId as any).lastName}`,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return {
    totalUsers,
    userStats,
    userStatusStats,
    totalApplications,
    applicationStats,
    totalCourses,
    courseStats,
    totalJobs,
    recentActivities,
  };
};
