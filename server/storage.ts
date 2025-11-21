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
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<Student>): Promise<Student | undefined>;
  updateStudentAttendance(rollNo: string, attendancePercentage: number): Promise<Student | undefined>;

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

import fs from "fs";
import path from "path";

export class FileStorage implements IStorage {
  private students: Map<string, Student>;
  private faculty: Map<string, Faculty>;
  private applications: Map<string, DLApplication>;
  private filePath: string;

  constructor() {
    this.students = new Map();
    this.faculty = new Map();
    this.applications = new Map();
    this.filePath = path.join(process.cwd(), "database.json");
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, "utf-8");
        const json = JSON.parse(data);

        if (json.students) {
          this.students = new Map(json.students.map((s: any) => [s.id, { ...s, createdAt: new Date(s.createdAt) }]));
        }
        if (json.faculty) {
          this.faculty = new Map(json.faculty.map((f: any) => [f.id, { ...f, createdAt: new Date(f.createdAt) }]));
        }
        if (json.applications) {
          this.applications = new Map(json.applications.map((a: any) => [
            a.id,
            {
              ...a,
              createdAt: new Date(a.createdAt),
              ccDate: a.ccDate ? new Date(a.ccDate) : null,
              hodDate: a.hodDate ? new Date(a.hodDate) : null,
              vpDate: a.vpDate ? new Date(a.vpDate) : null
            }
          ]));
        }
        console.log("📦 Data loaded from database.json");
      }
    } catch (error) {
      console.error("Error loading data from file:", error);
    }
  }

  private saveData() {
    try {
      const data = {
        students: Array.from(this.students.values()),
        faculty: Array.from(this.faculty.values()),
        applications: Array.from(this.applications.values()),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving data to file:", error);
    }
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

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
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
    this.saveData();
    return student;
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;

    const updated: Student = { ...student, ...updates };
    this.students.set(id, updated);
    this.saveData();
    return updated;
  }

  async updateStudentAttendance(
    rollNo: string,
    attendancePercentage: number
  ): Promise<Student | undefined> {
    const student = await this.getStudentByRollNo(rollNo);
    if (!student) return undefined;

    const updated: Student = {
      ...student,
      attendancePercentage,
    };
    this.students.set(student.id, updated);
    this.saveData();
    return updated;
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
    this.saveData();
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
    this.saveData();
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
    this.saveData();
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
    this.saveData();
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
    this.saveData();
    return updated;
  }
}

// Initialize storage based on environment configuration
import { MongoStorage } from "./mongoStorage";

// Use MongoDB if MONGODB_URI is set, otherwise fall back to file storage
const useMongoDb = !!process.env.MONGODB_URI;

let storageInstance: IStorage;

if (useMongoDb) {
  console.log("🔄 Initializing MongoDB storage...");
  storageInstance = new MongoStorage();
} else {
  console.log("📂 Using file-based storage (database.json)");
  storageInstance = new FileStorage();
}

export const storage = storageInstance;
