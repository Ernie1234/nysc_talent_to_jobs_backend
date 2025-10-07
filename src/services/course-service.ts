import { Types } from 'mongoose';
import {
  CourseModel,
  QrSessionModel,
  AttendanceModel,
  ICourse,
  IQrSession,
  IAttendance,
} from '@/models/course-model';
import {
  CreateCourseSchemaType,
  UpdateCourseSchemaType,
  CourseQuerySchemaType,
} from '@/validations/course-validation';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@/utils/app-error';
import { UserModel } from '@/models/user-model';

// Generate unique session code
const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Calculate attendance rate for a student
const calculateAttendanceRate = async (studentId: string, courseId: string): Promise<number> => {
  const course = await CourseModel.findById(courseId);
  if (!course) return 0;

  const totalSessions = course.totalSessions;
  if (totalSessions === 0) return 100;

  const attendedSessions = await AttendanceModel.countDocuments({
    studentId: new Types.ObjectId(studentId),
    sessionId: { $in: course.qrSessions },
    status: { $in: ['present', 'late'] },
  });

  return (attendedSessions / totalSessions) * 100;
};

export const createCourseService = async (
  staffId: string,
  data: CreateCourseSchemaType
): Promise<ICourse> => {
  const staff = await UserModel.findById(staffId);
  if (!staff || (staff.role !== 'STAFF' && staff.role !== 'ADMIN')) {
    throw new UnauthorizedException('Only staff can create courses');
  }

  const courseData = {
    ...data,
    staffId: new Types.ObjectId(staffId),
  };

  const course = await CourseModel.create(courseData);
  return course;
};

export const updateCourseService = async (
  courseId: string,
  staffId: string,
  data: UpdateCourseSchemaType
): Promise<ICourse> => {
  const course = await CourseModel.findOne({
    _id: new Types.ObjectId(courseId),
    staffId: new Types.ObjectId(staffId),
  });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  Object.assign(course, data);
  await course.save();

  return course;
};

export const getCourseService = async (courseId: string): Promise<ICourse> => {
  const course = await CourseModel.findById(courseId)
    .populate('staffId', 'firstName lastName email staffProfile')
    .populate('enrolledStudents', 'firstName lastName email profile');

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  return course;
};

export const getStaffCoursesService = async (
  staffId: string,
  query: CourseQuerySchemaType
): Promise<{
  courses: ICourse[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { status, page, limit, search } = query;

  const filter: any = { staffId: new Types.ObjectId(staffId) };

  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const total = await CourseModel.countDocuments(filter);
  const courses = await CourseModel.find(filter)
    .populate('staffId', 'firstName lastName email staffProfile')
    .populate('enrolledStudents', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const enrollCourseService = async (
  courseId: string,
  studentId: string
): Promise<ICourse> => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new NotFoundException('Course not found');
  }

  if (course.status !== 'published') {
    throw new BadRequestException('Course is not available for enrollment');
  }

  if (course.enrolledStudents.length >= course.maxStudents) {
    throw new BadRequestException('Course is full');
  }

  // Check if student is already enrolled
  const isEnrolled = course.enrolledStudents.some(id => id.toString() === studentId);

  if (isEnrolled) {
    throw new BadRequestException('Student is already enrolled in this course');
  }

  const existingEnrollment = await CourseModel.findOne({
    enrolledStudents: new Types.ObjectId(studentId),
    status: 'published',
    _id: { $ne: new Types.ObjectId(courseId) }, // Exclude the current course
  });
  if (existingEnrollment) {
    throw new BadRequestException(
      // eslint-disable-next-line max-len
      'You are already enrolled in another course. Please drop your current course before enrolling in a new one.'
    );
  }

  course.enrolledStudents.push(new Types.ObjectId(studentId));
  await course.save();

  return course;
};

export const generateQrSessionService = async (
  courseId: string,
  staffId: string,
  duration: number = 15
): Promise<{ qrSession: IQrSession; qrData: string }> => {
  const course = await CourseModel.findOne({
    _id: new Types.ObjectId(courseId),
    staffId: new Types.ObjectId(staffId),
  });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Generate unique session code
  const sessionCode = generateSessionCode();
  const expiresAt = new Date(Date.now() + duration * 60 * 1000); // Convert minutes to milliseconds

  const qrSession = await QrSessionModel.create({
    sessionCode,
    expiresAt,
    isActive: true,
  });

  // Add session to course
  course.qrSessions.push(qrSession._id);
  course.totalSessions += 1;
  await course.save();

  // QR data to be encoded (you can customize this)
  const qrData = JSON.stringify({
    sessionCode,
    courseId: course._id.toString(),
    expiresAt: expiresAt.toISOString(),
    staffId,
  });

  return { qrSession, qrData };
};

export const scanQrAttendanceService = async (
  sessionCode: string,
  studentId: string,
  location?: { latitude: number; longitude: number }
): Promise<IAttendance> => {
  // Find active session
  const qrSession = await QrSessionModel.findOne({
    sessionCode,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });

  if (!qrSession) {
    throw new BadRequestException('Invalid or expired QR session');
  }

  // Find course that contains this session
  const course = await CourseModel.findOne({
    qrSessions: qrSession._id,
  });

  if (!course) {
    throw new NotFoundException('Course not found for this session');
  }

  // Check if student is enrolled
  const isEnrolled = course.enrolledStudents.some(id => id.toString() === studentId);

  if (!isEnrolled) {
    throw new UnauthorizedException('You are not enrolled in this course');
  }

  // Check if already scanned
  const existingAttendance = await AttendanceModel.findOne({
    studentId: new Types.ObjectId(studentId),
    sessionId: qrSession._id,
  });

  if (existingAttendance) {
    throw new BadRequestException('Attendance already recorded for this session');
  }

  // Create attendance record
  const attendance = await AttendanceModel.create({
    studentId: new Types.ObjectId(studentId),
    sessionId: qrSession._id,
    status: 'present',
    location,
  });

  // Update attendance rate for student
  //   const attendanceRate = await calculateAttendanceRate(studentId, course._id.toString());

  // You might want to store this in a separate student progress collection
  // For now, we'll just return it

  return attendance;
};
export const getCourseAttendanceService = async (
  courseId: string,
  staffId: string
): Promise<{
  attendanceRecords: IAttendance[];
  studentStats: Array<{
    studentId: string;
    firstName: string;
    lastName: string;
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    status: 'PASS' | 'FAIL';
  }>;
}> => {
  const course = await CourseModel.findOne({
    _id: new Types.ObjectId(courseId),
    staffId: new Types.ObjectId(staffId),
  }).populate('enrolledStudents', 'firstName lastName email');

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Get all attendance records for this course
  const attendanceRecords = await AttendanceModel.find({
    sessionId: { $in: course.qrSessions },
  })
    .populate('studentId', 'firstName lastName email')
    .populate('sessionId')
    .sort({ scannedAt: -1 });

  // Calculate student statistics with proper typing
  const studentStats = await Promise.all(
    course.enrolledStudents.map(async (student: any) => {
      const attendanceRate = await calculateAttendanceRate(student._id.toString(), courseId);
      const status: 'PASS' | 'FAIL' = attendanceRate >= 70 ? 'PASS' : 'FAIL';

      return {
        studentId: student._id.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        totalSessions: course.totalSessions,
        attendedSessions: Math.floor((attendanceRate / 100) * course.totalSessions),
        attendanceRate,
        status,
      };
    })
  );

  return {
    attendanceRecords,
    studentStats,
  };
};

export interface ICourseWithVirtuals extends ICourse {
  enrolledCount: number;
  availableSpots: number | null;
}

// Update the getPublishedCoursesService return type
export const getPublishedCoursesService = async (
  query: CourseQuerySchemaType
): Promise<{
  courses: ICourseWithVirtuals[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { page, limit, search } = query;

  const filter: any = {
    status: 'published',
    isActive: true,
  };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { prerequisites: { $in: [new RegExp(search, 'i')] } },
      { learningObjectives: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const total = await CourseModel.countDocuments(filter);
  const courses = await CourseModel.find(filter)
    .populate('staffId', 'firstName lastName email staffProfile companyName')
    .populate('enrolledStudents', 'firstName lastName email')
    .select('-qrSessions')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Properly type the courses with virtuals
  const coursesWithVirtuals: ICourseWithVirtuals[] = courses.map(course => {
    const courseObj = course.toObject();
    return {
      ...courseObj,
      enrolledCount: course.enrolledStudents.length,
      availableSpots: course.maxStudents
        ? course.maxStudents - course.enrolledStudents.length
        : null,
    } as unknown as ICourseWithVirtuals;
  });

  return {
    courses: coursesWithVirtuals,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const dropCourseService = async (courseId: string, studentId: string): Promise<ICourse> => {
  const course = await CourseModel.findById(courseId);
  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Check if student is enrolled in this course
  const isEnrolled = course.enrolledStudents.some(id => id.toString() === studentId);
  if (!isEnrolled) {
    throw new BadRequestException('You are not enrolled in this course');
  }

  // Remove student from enrolled students
  course.enrolledStudents = course.enrolledStudents.filter(id => id.toString() !== studentId);

  await course.save();

  return course;
};

export const getCurrentEnrollmentService = async (studentId: string): Promise<ICourse | null> => {
  const course = await CourseModel.findOne({
    enrolledStudents: new Types.ObjectId(studentId),
    status: 'published',
  })
    .populate('staffId', 'firstName lastName email staffProfile')
    .select('-qrSessions');

  return course;
};
