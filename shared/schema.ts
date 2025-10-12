import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  rollNo: text("roll_no").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  department: text("department").notNull(),
  division: text("division").notNull(),
  attendancePercentage: integer("attendance_percentage").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faculty = pgTable("faculty", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'CC', 'HOD', 'VP'
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dlApplications = pgTable("dl_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  studentName: text("student_name").notNull(),
  rollNo: text("roll_no").notNull(),
  department: text("department").notNull(),
  division: text("division").notNull(),
  numberOfDays: integer("number_of_days").notNull(),
  reason: text("reason").notNull(),
  dateFrom: text("date_from").notNull(),
  dateTo: text("date_to").notNull(),
  additionalStudents: text("additional_students").array(),
  
  // Approval tracking
  ccStatus: text("cc_status").default("pending"), // pending, approved, rejected
  ccDate: timestamp("cc_date"),
  ccRemarks: text("cc_remarks"),
  
  hodStatus: text("hod_status").default("pending"),
  hodDate: timestamp("hod_date"),
  hodRemarks: text("hod_remarks"),
  
  vpStatus: text("vp_status").default("pending"),
  vpDate: timestamp("vp_date"),
  vpRemarks: text("vp_remarks"),
  
  overallStatus: text("overall_status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertFacultySchema = createInsertSchema(faculty).omit({
  id: true,
  createdAt: true,
});

export const insertDLApplicationSchema = createInsertSchema(dlApplications).omit({
  id: true,
  createdAt: true,
  ccStatus: true,
  ccDate: true,
  ccRemarks: true,
  hodStatus: true,
  hodDate: true,
  hodRemarks: true,
  vpStatus: true,
  vpDate: true,
  vpRemarks: true,
  overallStatus: true,
});

// Login schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["student", "faculty"]),
});

export const approvalSchema = z.object({
  applicationId: z.string(),
  action: z.enum(["approve", "reject"]),
  remarks: z.string().optional(),
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Faculty = typeof faculty.$inferSelect;
export type InsertFaculty = z.infer<typeof insertFacultySchema>;

export type DLApplication = typeof dlApplications.$inferSelect;
export type InsertDLApplication = z.infer<typeof insertDLApplicationSchema>;

export type LoginData = z.infer<typeof loginSchema>;
export type ApprovalData = z.infer<typeof approvalSchema>;
