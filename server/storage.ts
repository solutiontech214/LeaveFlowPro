import { randomUUID } from "crypto";
import type {
  Student,
  InsertStudent,
  Faculty,
  InsertFaculty,
  DLApplication,
  InsertDLApplication,
} from "@shared/schema";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getStudentByRollNo(rollNo: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Faculty operations
  getFaculty(id: string): Promise<Faculty | undefined>;
  getFacultyByEmail(email: string): Promise<Faculty | undefined>;
  getFacultyByRole(role: string, department?: string): Promise<Faculty | undefined>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;
  
  // DL Application operations
  getApplication(id: string): Promise<DLApplication | undefined>;
  getApplicationsByStudent(studentId: string): Promise<DLApplication[]>;
  getApplicationsByStatus(status: string): Promise<DLApplication[]>;
  getPendingApplicationsForCC(department: string): Promise<DLApplication[]>;
  getPendingApplicationsForHOD(department: string): Promise<DLApplication[]>;
  getPendingApplicationsForVP(): Promise<DLApplication[]>;
  createApplication(application: InsertDLApplication): Promise<DLApplication>;
  updateApplicationCCStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined>;
  updateApplicationHODStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined>;
  updateApplicationVPStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private faculty: Map<string, Faculty>;
  private applications: Map<string, DLApplication>;

  constructor() {
    this.students = new Map();
    this.faculty = new Map();
    this.applications = new Map();
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find((s) => s.email === email);
  }

  async getStudentByRollNo(rollNo: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find((s) => s.rollNo === rollNo);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      ...insertStudent,
      id,
      attendancePercentage: insertStudent.attendancePercentage ?? 0,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  // Faculty operations
  async getFaculty(id: string): Promise<Faculty | undefined> {
    return this.faculty.get(id);
  }

  async getFacultyByEmail(email: string): Promise<Faculty | undefined> {
    return Array.from(this.faculty.values()).find((f) => f.email === email);
  }

  async getFacultyByRole(
    role: string,
    department?: string
  ): Promise<Faculty | undefined> {
    return Array.from(this.faculty.values()).find(
      (f) => f.role === role && (!department || f.department === department)
    );
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const id = randomUUID();
    const facultyMember: Faculty = {
      ...insertFaculty,
      id,
      createdAt: new Date(),
    };
    this.faculty.set(id, facultyMember);
    return facultyMember;
  }

  // DL Application operations
  async getApplication(id: string): Promise<DLApplication | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByStudent(studentId: string): Promise<DLApplication[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.studentId === studentId
    );
  }

  async getApplicationsByStatus(status: string): Promise<DLApplication[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.overallStatus === status
    );
  }

  async getPendingApplicationsForCC(
    department: string
  ): Promise<DLApplication[]> {
    return Array.from(this.applications.values()).filter(
      (app) =>
        app.department === department &&
        app.ccStatus === "pending" &&
        app.overallStatus === "pending"
    );
  }

  async getPendingApplicationsForHOD(
    department: string
  ): Promise<DLApplication[]> {
    return Array.from(this.applications.values()).filter(
      (app) =>
        app.department === department &&
        app.numberOfDays >= 2 &&
        app.ccStatus === "approved" &&
        app.hodStatus === "pending" &&
        app.overallStatus === "pending"
    );
  }

  async getPendingApplicationsForVP(): Promise<DLApplication[]> {
    return Array.from(this.applications.values()).filter(
      (app) =>
        app.numberOfDays > 2 &&
        app.ccStatus === "approved" &&
        app.hodStatus === "approved" &&
        app.vpStatus === "pending" &&
        app.overallStatus === "pending"
    );
  }

  async createApplication(
    insertApp: InsertDLApplication
  ): Promise<DLApplication> {
    const id = randomUUID();
    const application: DLApplication = {
      ...insertApp,
      id,
      additionalStudents: insertApp.additionalStudents ?? null,
      ccStatus: "pending",
      ccDate: null,
      ccRemarks: null,
      hodStatus: "pending",
      hodDate: null,
      hodRemarks: null,
      vpStatus: "pending",
      vpDate: null,
      vpRemarks: null,
      overallStatus: "pending",
      createdAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplicationCCStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updated: DLApplication = {
      ...app,
      ccStatus: status,
      ccDate: new Date(),
      ccRemarks: remarks || null,
      overallStatus:
        status === "rejected"
          ? "rejected"
          : app.numberOfDays === 1
          ? "approved"
          : "pending",
    };
    this.applications.set(id, updated);
    return updated;
  }

  async updateApplicationHODStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updated: DLApplication = {
      ...app,
      hodStatus: status,
      hodDate: new Date(),
      hodRemarks: remarks || null,
      overallStatus:
        status === "rejected"
          ? "rejected"
          : app.numberOfDays === 2
          ? "approved"
          : "pending",
    };
    this.applications.set(id, updated);
    return updated;
  }

  async updateApplicationVPStatus(
    id: string,
    status: string,
    remarks?: string
  ): Promise<DLApplication | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updated: DLApplication = {
      ...app,
      vpStatus: status,
      vpDate: new Date(),
      vpRemarks: remarks || null,
      overallStatus: status === "rejected" ? "rejected" : "approved",
    };
    this.applications.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
