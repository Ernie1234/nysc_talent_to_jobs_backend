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
  dropCourseController,
  getCurrentEnrollmentController,
  checkClearanceEligibilityController,
  generatePerformanceClearanceController,
} from '@/controllers/course-controller';

const router = Router();

// All routes require JWT authentication
router.use(passportAuthenticateJwt);

// Course CRUD routes (Staff only)
router.post('/', createCourseController);
router.get('/staff', getStaffCoursesController);
router.get('/:courseId', getCourseController);
router.put('/:courseId', updateCourseController);
router.get('/enrollment/current', getCurrentEnrollmentController);

// Published courses route (For students) - ADD THIS
router.get('/', getPublishedCoursesController);
router.delete('/:courseId/drop', dropCourseController);

// Enrollment routes (Corps members only)
router.post('/:courseId/enroll', enrollCourseController);

// QR Attendance routes
router.post('/:courseId/generate-qr', generateQrSessionController); // Staff only
router.post('/scan-attendance', scanQrAttendanceController); // Corps members only
router.get('/:courseId/attendance', getCourseAttendanceController); // Staff only

// Performance clearance routes
router.get('/:courseId/clearance/check', checkClearanceEligibilityController);
router.get('/:courseId/clearance/download', generatePerformanceClearanceController);

export default router;
