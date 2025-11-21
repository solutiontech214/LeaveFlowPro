import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import {
  loginSchema,
  insertStudentSchema,
  insertDLApplicationSchema,
  approvalSchema,
} from "@shared/schema";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT authentication");
}

const JWT_SECRET = process.env.SESSION_SECRET;

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    (req as any).user = user;
    next();
  });
}

// Helper function to send email notifications
async function sendApprovalEmail(
  toEmail: string,
  studentName: string,
  numberOfDays: number,
  reason: string,
  role: string
) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured, skipping email notification");
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `New Duty Leave Application - ${studentName}`,
      html: `
        <h2>New Duty Leave Application Requires Your Approval</h2>
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Number of Days:</strong> ${numberOfDays}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Your Role:</strong> ${role}</p>
        <br/>
        <p>Please log in to the Duty Leave Management System to review and approve/reject this application.</p>
        <p><a href="${process.env.APP_URL || 'http://localhost:5000'}">Go to Dashboard</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail} (${role})`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Registering routes...");

  // DEBUG ENDPOINT - REMOVE LATER
  app.get("/api/debug/users", async (_req, res) => {
    console.log("Debug endpoint hit!");
    try {
      const student = await storage.getStudentByEmail("rahul@institute.edu");
      const faculty = await storage.getFacultyByEmail("pradeep.cc@institute.edu");

      console.log("Debug check:", { studentFound: !!student, facultyFound: !!faculty });

      res.json({
        studentFound: !!student,
        studentDetails: student ? { id: student.id, email: student.email, passwordHash: student.password.substring(0, 10) + "..." } : null,
        facultyFound: !!faculty,
        facultyDetails: faculty ? { id: faculty.id, email: faculty.email } : null
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, role } = loginSchema.parse(req.body);

      let user: any;
      let userData: any;

      if (role === "student") {
        user = await storage.getStudentByEmail(email);
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "student",
          rollNo: user.rollNo,
          department: user.department,
          division: user.division,
          attendancePercentage: user.attendancePercentage,
        };
      } else {
        user = await storage.getFacultyByEmail(email);
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "faculty",
          facultyType: user.role,
          department: user.department,
        };
      }

      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: userData });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  // Student registration (for testing)
  app.post("/api/auth/register-student", async (req: Request, res: Response) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const student = await storage.createStudent({
        ...data,
        password: hashedPassword,
      });

      res.json({ message: "Student registered successfully", id: student.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // Get current user info
  app.get("/api/auth/me", authenticateToken, (req: Request, res: Response) => {
    res.json({ user: (req as any).user });
  });

  // DL Application routes
  app.post(
    "/api/applications",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "student") {
          return res.status(403).json({ error: "Only students can apply" });
        }

        const student = await storage.getStudent(user.id);
        if (!student) {
          return res.status(404).json({ error: "Student not found" });
        }

        if (student.attendancePercentage < 75) {
          return res.status(400).json({
            error: "Attendance below 75%, not eligible to apply",
          });
        }

        const data = insertDLApplicationSchema.parse(req.body);
        const application = await storage.createApplication(data);

        // Determine which faculty to notify based on number of days
        const numberOfDays = parseInt(data.numberOfDays as any);

        // Always notify CC
        const cc = await storage.getFacultyByRole("CC", student.department);
        if (cc) {
          await sendApprovalEmail(
            cc.email,
            student.name,
            numberOfDays,
            data.reason,
            "Class Coordinator"
          );
        }

        // Notify HOD if 2+ days
        if (numberOfDays >= 2) {
          const hod = await storage.getFacultyByRole("HOD", student.department);
          if (hod) {
            await sendApprovalEmail(
              hod.email,
              student.name,
              numberOfDays,
              data.reason,
              "Head of Department"
            );
          }
        }

        // Notify VP if >2 days
        if (numberOfDays > 2) {
          const vp = await storage.getFacultyByRole("VP");
          if (vp) {
            await sendApprovalEmail(
              vp.email,
              student.name,
              numberOfDays,
              data.reason,
              "Vice Principal"
            );
          }
        }

        res.json(application);
      } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to create application" });
      }
    }
  );

  // Get applications for student
  app.get(
    "/api/applications/my",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "student") {
          return res.status(403).json({ error: "Only students can access this" });
        }

        const applications = await storage.getApplicationsByStudent(user.id);
        res.json(applications);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Get applications for faculty (based on role)
  app.get(
    "/api/applications/pending",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "faculty") {
          return res.status(403).json({ error: "Only faculty can access this" });
        }

        let applications: any[] = [];

        if (user.facultyType === "CC") {
          applications = await storage.getPendingApplicationsForCC(user.department);
        } else if (user.facultyType === "HOD") {
          applications = await storage.getPendingApplicationsForHOD(user.department);
        } else if (user.facultyType === "VP") {
          applications = await storage.getPendingApplicationsForVP();
        }

        res.json(applications);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Get all applications for faculty (by status)
  app.get(
    "/api/applications/all",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "faculty") {
          return res.status(403).json({ error: "Only faculty can access this" });
        }

        const status = req.query.status as string;
        let applications: any[] = [];

        if (status) {
          applications = await storage.getApplicationsByStatus(status);
        } else {
          // Get all applications for the faculty's department
          const allApplications = await storage.getApplicationsByStatus("pending");
          const approved = await storage.getApplicationsByStatus("approved");
          const rejected = await storage.getApplicationsByStatus("rejected");
          applications = [...allApplications, ...approved, ...rejected];
        }

        // Filter by department for CC and HOD
        if (user.facultyType === "CC" || user.facultyType === "HOD") {
          applications = applications.filter(
            (app) => app.department === user.department
          );
        }

        res.json(applications);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Approve/Reject application
  app.post(
    "/api/applications/approve",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "faculty") {
          return res.status(403).json({ error: "Only faculty can approve" });
        }

        const { applicationId, action, remarks } = approvalSchema.parse(req.body);
        const status = action === "approve" ? "approved" : "rejected";

        // Get the application to check approval sequence
        const application = await storage.getApplication(applicationId);
        if (!application) {
          return res.status(404).json({ error: "Application not found" });
        }

        let updatedApp;

        if (user.facultyType === "CC") {
          // CC can always approve/reject
          updatedApp = await storage.updateApplicationCCStatus(
            applicationId,
            status,
            remarks
          );
        } else if (user.facultyType === "HOD") {
          // HOD can only approve if CC has approved and application requires HOD approval (≥2 days)
          if (application.numberOfDays < 2) {
            return res.status(403).json({
              error: "This application does not require HOD approval"
            });
          }
          if (application.ccStatus !== "approved") {
            return res.status(403).json({
              error: "Cannot approve: CC approval is required first"
            });
          }
          updatedApp = await storage.updateApplicationHODStatus(
            applicationId,
            status,
            remarks
          );
        } else if (user.facultyType === "VP") {
          // VP can only approve if CC and HOD have approved and application requires VP approval (>2 days)
          if (application.numberOfDays <= 2) {
            return res.status(403).json({
              error: "This application does not require VP approval"
            });
          }
          if (application.ccStatus !== "approved") {
            return res.status(403).json({
              error: "Cannot approve: CC approval is required first"
            });
          }
          if (application.hodStatus !== "approved") {
            return res.status(403).json({
              error: "Cannot approve: HOD approval is required first"
            });
          }
          updatedApp = await storage.updateApplicationVPStatus(
            applicationId,
            status,
            remarks
          );
        }

        if (!updatedApp) {
          return res.status(500).json({ error: "Failed to update application" });
        }

        res.json(updatedApp);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Attendance upload endpoint
  app.post(
    "/api/attendance/upload",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        if (user.role !== "faculty") {
          return res.status(403).json({ error: "Only faculty can upload attendance" });
        }

        const { attendanceData } = req.body;
        if (!Array.isArray(attendanceData)) {
          return res.status(400).json({ error: "Invalid data format" });
        }

        const results = {
          successful: [] as string[],
          failed: [] as { rollNo: string; reason: string }[],
        };

        for (const record of attendanceData) {
          const { rollNo, attendancePercentage } = record;

          if (!rollNo || attendancePercentage === undefined) {
            results.failed.push({
              rollNo: rollNo || "unknown",
              reason: "Missing rollNo or attendancePercentage",
            });
            continue;
          }

          // Validate percentage range
          const percentage = parseFloat(attendancePercentage);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            results.failed.push({
              rollNo,
              reason: "Invalid attendance percentage (must be 0-100)",
            });
            continue;
          }

          // Get student to check department
          const student = await storage.getStudentByRollNo(rollNo);
          if (!student) {
            results.failed.push({
              rollNo,
              reason: "Student not found",
            });
            continue;
          }

          // Check department access for CC and HOD
          if (user.facultyType === "CC" || user.facultyType === "HOD") {
            if (student.department !== user.department) {
              results.failed.push({
                rollNo,
                reason: "Access denied: Student not in your department",
              });
              continue;
            }
          }

          // Update attendance
          const updated = await storage.updateStudentAttendance(rollNo, percentage);
          if (updated) {
            results.successful.push(rollNo);
          } else {
            results.failed.push({
              rollNo,
              reason: "Failed to update",
            });
          }
        }

        res.json({
          message: "Attendance upload completed",
          successCount: results.successful.length,
          failureCount: results.failed.length,
          successful: results.successful,
          failed: results.failed,
        });
      } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to upload attendance" });
      }
    }
  );


  // Bulk student import endpoint
  app.post(
    "/api/students/bulk-import",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;

        // Only faculty can import students
        if (user.role !== "faculty") {
          return res.status(403).json({
            error: "Only faculty members can import students"
          });
        }

        const { students } = req.body;
        if (!Array.isArray(students)) {
          return res.status(400).json({ error: "Invalid data format" });
        }

        const results = {
          successful: [] as string[],
          failed: [] as { rollNo: string; reason: string }[],
        };

        for (const studentData of students) {
          const { name, email, password, department, division, rollNo, attendancePercentage } = studentData;

          // Validate required fields
          if (!name || !email || !password || !department || !division || !rollNo) {
            results.failed.push({
              rollNo: rollNo || "unknown",
              reason: "Missing required fields (name, email, password, department, division, rollNo)",
            });
            continue;
          }

          // Department validation for CC and HOD
          if (user.facultyType === "CC" || user.facultyType === "HOD") {
            if (department !== user.department) {
              results.failed.push({
                rollNo,
                reason: `Access denied: You can only import students for ${user.department} department`,
              });
              continue;
            }
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            results.failed.push({
              rollNo,
              reason: "Invalid email format",
            });
            continue;
          }

          // Check for duplicate email
          const existingByEmail = await storage.getStudentByEmail(email);
          if (existingByEmail) {
            results.failed.push({
              rollNo,
              reason: "Email already exists",
            });
            continue;
          }

          // Check for duplicate rollNo
          const existingByRollNo = await storage.getStudentByRollNo(rollNo);
          if (existingByRollNo) {
            results.failed.push({
              rollNo,
              reason: "Roll number already exists",
            });
            continue;
          }

          // Validate attendance percentage
          const attendance = attendancePercentage !== undefined
            ? parseFloat(attendancePercentage)
            : 0;
          if (isNaN(attendance) || attendance < 0 || attendance > 100) {
            results.failed.push({
              rollNo,
              reason: "Invalid attendance percentage (must be 0-100)",
            });
            continue;
          }

          try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create student
            await storage.createStudent({
              name,
              email,
              password: hashedPassword,
              department,
              division,
              rollNo,
              attendancePercentage: Math.round(attendance),
            });

            results.successful.push(rollNo);
          } catch (error: any) {
            results.failed.push({
              rollNo,
              reason: error.message || "Failed to create student",
            });
          }
        }

        res.json({
          message: "Student import completed",
          successCount: results.successful.length,
          failureCount: results.failed.length,
          successful: results.successful,
          failed: results.failed,
        });
      } catch (error: any) {
        res.status(400).json({
          error: error.message || "Failed to import students"
        });
      }
    }
  );

  // Get all students endpoint (for faculty)
  app.get(
    "/api/students",
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;

        // Only faculty can view all students
        if (user.role !== "faculty") {
          return res.status(403).json({
            error: "Only faculty members can view all students"
          });
        }

        const students = await storage.getAllStudents();

        // Remove sensitive data like passwords
        const sanitizedStudents = students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          department: student.department,
          division: student.division,
          attendancePercentage: student.attendancePercentage,
          createdAt: student.createdAt,
        }));

        res.json(sanitizedStudents);
      } catch (error: any) {
        res.status(500).json({
          error: error.message || "Failed to fetch students"
        });
      }
    }
  );

  // DEBUG ENDPOINT - REMOVE LATER
  app.get("/api/debug/users", async (_req, res) => {
    try {
      const student = await storage.getStudentByEmail("rahul@institute.edu");
      const faculty = await storage.getFacultyByEmail("pradeep.cc@institute.edu");

      res.json({
        studentFound: !!student,
        studentDetails: student ? { id: student.id, email: student.email, passwordHash: student.password.substring(0, 10) + "..." } : null,
        facultyFound: !!faculty,
        facultyDetails: faculty ? { id: faculty.id, email: faculty.email } : null
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
