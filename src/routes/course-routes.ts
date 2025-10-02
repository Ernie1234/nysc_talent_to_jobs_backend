import { Router } from 'express';
import { passportAuthenticateJwt } from '@/config/passport-config';
import {
  createCourseController,
  updateCourseController,
  getCourseController,
  getStaffCoursesController,
  getPublishedCoursesController,
  enrollCourseController,
  generateQrSessionController,
  scanQrAttendanceController,
  getCourseAttendanceController,
} from '@/controllers/course-controller';

const router = Router();

// All routes require JWT authentication
router.use(passportAuthenticateJwt);

// Course CRUD routes (Staff only)
router.post('/', createCourseController);
router.get('/staff', getStaffCoursesController);
router.get('/:courseId', getCourseController);
router.put('/:courseId', updateCourseController);

// Published courses route (For students) - ADD THIS
router.get('/', getPublishedCoursesController);

// Enrollment routes (Corps members only)
router.post('/:courseId/enroll', enrollCourseController);

// QR Attendance routes
router.post('/:courseId/generate-qr', generateQrSessionController); // Staff only
router.post('/scan-attendance', scanQrAttendanceController); // Corps members only
router.get('/:courseId/attendance', getCourseAttendanceController); // Staff only

export default router;
