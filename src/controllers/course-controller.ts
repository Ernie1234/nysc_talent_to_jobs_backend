import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler } from '@/middleware/asyncHandler.middlerware';
import {
  createCourseSchema,
  updateCourseSchema,
  courseQuerySchema,
  generateQrSchema,
  scanQrSchema,
} from '@/validations/course-validation';
import {
  createCourseService,
  updateCourseService,
  getCourseService,
  getStaffCoursesService,
  enrollCourseService,
  generateQrSessionService,
  scanQrAttendanceService,
  getCourseAttendanceService,
  getPublishedCoursesService,
  dropCourseService,
  getCurrentEnrollmentService,
} from '@/services/course-service';
import { HTTPSTATUS } from '@/config/http-config';
import { NotFoundException, UnauthorizedException } from '@/utils/app-error';
import {
  checkClearanceEligibility,
  generatePerformanceClearance,
} from '@/services/performance-clearance-service';

export const createCourseController = asyncHandler(async (req: Request, res: Response) => {
  const courseData = createCourseSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only staff can create courses');
  }

  const course = await createCourseService(user.id, courseData);

  return res.status(HTTPSTATUS.CREATED).json({
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

export const getPublishedCoursesController = asyncHandler(async (req: Request, res: Response) => {
  const query = courseQuerySchema.parse(req.query);

  const result = await getPublishedCoursesService(query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Published courses fetched successfully',
    data: result,
  });
});

export const updateCourseController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const updateData = updateCourseSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const course = await updateCourseService(courseId!, user.id, updateData);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Course updated successfully',
    data: course,
  });
});

export const getCourseController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  if (!Types.ObjectId.isValid(courseId!)) {
    throw new NotFoundException('Invalid course ID format');
  }

  const course = await getCourseService(courseId!);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Course fetched successfully',
    data: course,
  });
});

export const getStaffCoursesController = asyncHandler(async (req: Request, res: Response) => {
  const query = courseQuerySchema.parse(req.query);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const result = await getStaffCoursesService(user.id, query);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Courses fetched successfully',
    data: result,
  });
});

export const enrollCourseController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
    throw new UnauthorizedException('Only corps members can enroll in courses');
  }

  const course = await enrollCourseService(courseId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Successfully enrolled in course. You can only be enrolled in one course at a time.',
    data: course,
  });
});

export const generateQrSessionController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { duration } = generateQrSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only staff can generate QR codes');
  }

  const { qrSession, qrData } = await generateQrSessionService(courseId!, user.id, duration);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'QR session generated successfully',
    data: {
      qrSession,
      qrData, // This should be encoded into QR code on frontend
      expiresAt: qrSession.expiresAt,
    },
  });
});

export const scanQrAttendanceController = asyncHandler(async (req: Request, res: Response) => {
  const { sessionCode, location } = scanQrSchema.parse(req.body);
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
    throw new UnauthorizedException('Only corps members can scan attendance');
  }

  const attendance = await scanQrAttendanceService(sessionCode, user.id, location);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Attendance recorded successfully',
    data: attendance,
  });
});

export const getCourseAttendanceController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'STAFF' && user.role !== 'ADMIN') {
    throw new UnauthorizedException('Only staff can view attendance');
  }

  const attendanceData = await getCourseAttendanceService(courseId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Attendance data fetched successfully',
    data: attendanceData,
  });
});
export const dropCourseController = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
    throw new UnauthorizedException('Only corps members can drop courses');
  }

  const course = await dropCourseService(courseId!, user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Successfully dropped course',
    data: course,
  });
});

export const getCurrentEnrollmentController = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
    throw new UnauthorizedException('Only corps members can view enrollment');
  }

  const course = await getCurrentEnrollmentService(user.id);

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'Current enrollment fetched successfully',
    data: course,
  });
});

export const generatePerformanceClearanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
      throw new UnauthorizedException('Only corps members can generate performance clearance');
    }

    await generatePerformanceClearance(user.id, courseId!, res);
  }
);

export const checkClearanceEligibilityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const user = req.user;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'CORPS_MEMBER' && user.role !== 'SIWES') {
      throw new UnauthorizedException('Only corps members can check clearance eligibility');
    }

    const eligibility = await checkClearanceEligibility(user.id, courseId!);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: 'Eligibility checked successfully',
      data: eligibility,
    });
  }
);
