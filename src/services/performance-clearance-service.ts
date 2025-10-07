/* eslint-disable max-len */
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { UserModel } from '@/models/user-model';
import { AttendanceModel, CourseModel } from '@/models/course-model';
import { NotFoundException, BadRequestException } from '@/utils/app-error';
import { calculateAttendanceRate } from './course-service';

export interface PerformanceClearanceData {
  corpsMemberName: string;
  fctCodeNo: string;
  bankName: string;
  accountNo: string;
  month: string;
  year: string;
  courseName: string;
  attendanceRate: number;
  totalSessions: number;
  attendedSessions: number;
  staffPosition: string;
}

export const generatePerformanceClearance = async (
  studentId: string,
  courseId: string,
  res: Response
): Promise<void> => {
  // Get student and course details
  const student = await UserModel.findById(studentId);
  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const course = await CourseModel.findById(courseId).populate(
    'staffId',
    'firstName lastName email staffProfile'
  );

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Calculate attendance rate
  const attendanceRate = await calculateAttendanceRate(studentId, courseId);

  if (attendanceRate < 70) {
    throw new BadRequestException(
      `Attendance rate (${attendanceRate.toFixed(1)}%) is below the required 70% for performance clearance`
    );
  }

  // Get attended sessions count
  const attendedSessions = await AttendanceModel.countDocuments({
    studentId: student._id,
    sessionId: { $in: course.qrSessions },
    status: { $in: ['present', 'late'] },
  });

  // Prepare data for PDF
  const clearanceData: PerformanceClearanceData = {
    corpsMemberName: `${student.firstName} ${student.lastName}`,
    fctCodeNo: student.profile?.stateCode ?? 'N/A',
    bankName: student.profile?.bankName ?? 'N/A',
    accountNo: student.profile?.accountNumber ?? 'N/A',
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    courseName: course.title,
    attendanceRate,
    totalSessions: course.totalSessions,
    attendedSessions,
    staffPosition: 'Course Instructor',
  };

  // Generate PDF
  await createPerformanceClearancePDF(clearanceData, res);
};

const createPerformanceClearancePDF = (
  data: PerformanceClearanceData,
  res: Response
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="performance-clearance-${data.corpsMemberName.replace(/\s+/g, '-')}.pdf"`
      );

      doc.pipe(res);

      // Add header with NITDA information
      addHeader(doc);

      // Add main content
      addMainContent(doc, data);

      // Add footer
      addFooter(doc);

      doc.end();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const addHeader = (doc: any): void => {
  // NITDA Header
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('NITDA/HQ/NYSC/017/VOL.XIII', 50, 50, { align: 'left' })
    .font('Helvetica')
    .text('October 03, 2025', 50, 65, { align: 'left' })
    .moveDown(2);
};

const addMainContent = (doc: any, data: PerformanceClearanceData): void => {
  // Add "PERFORMANCE CERTIFICATE" title
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('PERFORMANCE CERTIFICATE', { align: 'center' })
    .moveDown(1.5);

  // Main content
  doc
    .fontSize(12)
    .font('Helvetica')
    .text(
      'This is to certify that the corps member whose particulars are given below has performed his/her official duties satisfactorily for the month.',
      { align: 'left' }
    )
    .moveDown(2);

  // Corps member details
  const startY = doc.y;

  doc
    .font('Helvetica-Bold')
    .text('Name of Corps Member:', 50, startY)
    .font('Helvetica')
    .text(data.corpsMemberName, 200, startY)
    .moveDown(1);

  doc
    .font('Helvetica-Bold')
    .text('FCT Code No:', 50, doc.y)
    .font('Helvetica')
    .text(data.fctCodeNo, 200, doc.y)
    .moveDown(1);

  doc
    .font('Helvetica-Bold')
    .text('Bank Name:', 50, doc.y)
    .font('Helvetica')
    .text(data.bankName, 200, doc.y)
    .moveDown(1);

  doc
    .font('Helvetica-Bold')
    .text('Account No:', 50, doc.y)
    .font('Helvetica')
    .text(data.accountNo, 200, doc.y)
    .moveDown(1);

  // Course and attendance details
  doc
    .font('Helvetica-Bold')
    .text('Course Attended:', 50, doc.y)
    .font('Helvetica')
    .text(data.courseName, 200, doc.y)
    .moveDown(1);

  doc
    .font('Helvetica-Bold')
    .text('Attendance Rate:', 50, doc.y)
    .font('Helvetica')
    .text(
      `${data.attendanceRate.toFixed(1)}% (${data.attendedSessions} of ${data.totalSessions} sessions)`,
      200,
      doc.y
    )
    .moveDown(2);

  // Recommendation text
  doc
    .text(
      `The payment of the officer's allowance for the month of ${data.month}, ${data.year} is hereby recommended please.`,
      { align: 'left' }
    )
    .moveDown(3);

  doc
    // eslint-disable-next-line quotes
    .text("Please accept the assurances of the Director General's esteemed regard", {
      align: 'left',
    })
    .moveDown(2);

  doc
    .font('Helvetica-Bold')
    .text('TARELA AMBI (MRS)', { align: 'left' })
    .font('Helvetica')
    .text('For: Director Human Resource and Administration', { align: 'left' })
    .moveDown(1);
};

const addFooter = (doc: any): void => {
  const bottomY = 700;

  doc
    .fontSize(8)
    .font('Helvetica')
    .text('National Information Technology Development Agency', 50, bottomY, { align: 'left' })
    .text(
      'Corporate Headquarters: No. 28, Port Harcourt Crescent, Off Gimbiya Street, RM.B564, Area 11, Garki, Nigeria',
      50,
      bottomY + 12,
      { align: 'left' }
    )
    .text('+2348168401851 +2347052420189 info@nitda.gov.ng www.nitda.gov.ng', 50, bottomY + 24, {
      align: 'left',
    })
    .text('FEDERAL MINISTRY OF COMMUNICATIONS, INNOVATION AND DIGITAL ECONOMY', 50, bottomY + 36, {
      align: 'left',
    });
};

// Method to check eligibility
export const checkClearanceEligibility = async (
  studentId: string,
  courseId: string
): Promise<{
  eligible: boolean;
  attendanceRate: number;
  requiredRate: number;
  message: string;
}> => {
  const attendanceRate = await calculateAttendanceRate(studentId, courseId);
  const eligible = attendanceRate >= 70;

  return {
    eligible,
    attendanceRate,
    requiredRate: 70,
    message: eligible
      ? 'Eligible for performance clearance'
      : `Attendance rate (${attendanceRate.toFixed(1)}%) is below the required 70%`,
  };
};
