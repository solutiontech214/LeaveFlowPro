import mongoose from "mongoose";
import type { IStorage } from "./storage";
import type {
    Student,
    InsertStudent,
    Faculty,
    InsertFaculty,
    DLApplication,
    InsertDLApplication,
} from "@shared/schema";
import {
    StudentModel,
    FacultyModel,
    DLApplicationModel,
    documentToObject,
} from "./models";

export class MongoStorage implements IStorage {
    private connected: boolean = false;

    constructor() {
        this.connect();
    }

    private async connect() {
        try {
            const mongoUri =
                process.env.MONGODB_URI || "mongodb://localhost:27017/leaveflowpro";
            await mongoose.connect(mongoUri);
            this.connected = true;
            console.log("✅ Connected to MongoDB successfully");
            console.log(`📦 Database: ${mongoose.connection.db?.databaseName || 'N/A'}`);
        } catch (error) {
            console.error("❌ MongoDB connection error:", error);
            this.connected = false;
            throw error;
        }
    }

    // Student operations
    async getStudent(id: string): Promise<Student | undefined> {
        try {
            const student = await StudentModel.findById(id);
            return student ? documentToObject<Student>(student) : undefined;
        } catch (error) {
            console.error("Error getting student:", error);
            return undefined;
        }
    }

    async getStudentByEmail(email: string): Promise<Student | undefined> {
        try {
            const student = await StudentModel.findOne({ email });
            return student ? documentToObject<Student>(student) : undefined;
        } catch (error) {
            console.error("Error getting student by email:", error);
            return undefined;
        }
    }

    async getStudentByRollNo(rollNo: string): Promise<Student | undefined> {
        try {
            const student = await StudentModel.findOne({ rollNo });
            return student ? documentToObject<Student>(student) : undefined;
        } catch (error) {
            console.error("Error getting student by rollNo:", error);
            return undefined;
        }
    }

    async getAllStudents(): Promise<Student[]> {
        try {
            const students = await StudentModel.find({}).sort({ rollNo: 1 });
            return students.map((student) => documentToObject<Student>(student));
        } catch (error) {
            console.error("Error getting all students:", error);
            return [];
        }
    }

    async createStudent(insertStudent: InsertStudent): Promise<Student> {
        try {
            const student = await StudentModel.create(insertStudent);
            return documentToObject<Student>(student);
        } catch (error) {
            console.error("Error creating student:", error);
            throw error;
        }
    }

    async updateStudent(
        id: string,
        updates: Partial<Student>
    ): Promise<Student | undefined> {
        try {
            const student = await StudentModel.findByIdAndUpdate(id, updates, {
                new: true,
            });
            return student ? documentToObject<Student>(student) : undefined;
        } catch (error) {
            console.error("Error updating student:", error);
            return undefined;
        }
    }

    async updateStudentAttendance(
        rollNo: string,
        attendancePercentage: number
    ): Promise<Student | undefined> {
        try {
            const student = await StudentModel.findOneAndUpdate(
                { rollNo },
                { attendancePercentage },
                { new: true }
            );
            return student ? documentToObject<Student>(student) : undefined;
        } catch (error) {
            console.error("Error updating student attendance:", error);
            return undefined;
        }
    }

    // Faculty operations
    async getFaculty(id: string): Promise<Faculty | undefined> {
        try {
            const faculty = await FacultyModel.findById(id);
            return faculty ? documentToObject<Faculty>(faculty) : undefined;
        } catch (error) {
            console.error("Error getting faculty:", error);
            return undefined;
        }
    }

    async getFacultyByEmail(email: string): Promise<Faculty | undefined> {
        try {
            const faculty = await FacultyModel.findOne({ email });
            return faculty ? documentToObject<Faculty>(faculty) : undefined;
        } catch (error) {
            console.error("Error getting faculty by email:", error);
            return undefined;
        }
    }

    async getFacultyByRole(
        role: string,
        department?: string
    ): Promise<Faculty | undefined> {
        try {
            const query: any = { role };
            if (department) {
                query.department = department;
            }
            const faculty = await FacultyModel.findOne(query);
            return faculty ? documentToObject<Faculty>(faculty) : undefined;
        } catch (error) {
            console.error("Error getting faculty by role:", error);
            return undefined;
        }
    }

    async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
        try {
            const faculty = await FacultyModel.create(insertFaculty);
            return documentToObject<Faculty>(faculty);
        } catch (error) {
            console.error("Error creating faculty:", error);
            throw error;
        }
    }

    // DL Application operations
    async getApplication(id: string): Promise<DLApplication | undefined> {
        try {
            const application = await DLApplicationModel.findById(id);
            return application
                ? documentToObject<DLApplication>(application)
                : undefined;
        } catch (error) {
            console.error("Error getting application:", error);
            return undefined;
        }
    }

    async getApplicationsByStudent(
        studentId: string
    ): Promise<DLApplication[]> {
        try {
            const applications = await DLApplicationModel.find({
                studentId,
            }).sort({ createdAt: -1 });
            return applications.map((app) => documentToObject<DLApplication>(app));
        } catch (error) {
            console.error("Error getting applications by student:", error);
            return [];
        }
    }

    async getApplicationsByStatus(status: string): Promise<DLApplication[]> {
        try {
            const applications = await DLApplicationModel.find({
                overallStatus: status,
            }).sort({ createdAt: -1 });
            return applications.map((app) => documentToObject<DLApplication>(app));
        } catch (error) {
            console.error("Error getting applications by status:", error);
            return [];
        }
    }

    async getPendingApplicationsForCC(
        department: string
    ): Promise<DLApplication[]> {
        try {
            const applications = await DLApplicationModel.find({
                department,
                ccStatus: "pending",
                overallStatus: "pending",
            }).sort({ createdAt: -1 });
            return applications.map((app) => documentToObject<DLApplication>(app));
        } catch (error) {
            console.error("Error getting pending applications for CC:", error);
            return [];
        }
    }

    async getPendingApplicationsForHOD(
        department: string
    ): Promise<DLApplication[]> {
        try {
            const applications = await DLApplicationModel.find({
                department,
                numberOfDays: { $gte: 2 },
                ccStatus: "approved",
                hodStatus: "pending",
                overallStatus: "pending",
            }).sort({ createdAt: -1 });
            return applications.map((app) => documentToObject<DLApplication>(app));
        } catch (error) {
            console.error("Error getting pending applications for HOD:", error);
            return [];
        }
    }

    async getPendingApplicationsForVP(): Promise<DLApplication[]> {
        try {
            const applications = await DLApplicationModel.find({
                numberOfDays: { $gt: 2 },
                ccStatus: "approved",
                hodStatus: "approved",
                vpStatus: "pending",
                overallStatus: "pending",
            }).sort({ createdAt: -1 });
            return applications.map((app) => documentToObject<DLApplication>(app));
        } catch (error) {
            console.error("Error getting pending applications for VP:", error);
            return [];
        }
    }

    async createApplication(
        insertApp: InsertDLApplication
    ): Promise<DLApplication> {
        try {
            const application = await DLApplicationModel.create({
                ...insertApp,
                ccStatus: "pending",
                hodStatus: "pending",
                vpStatus: "pending",
                overallStatus: "pending",
            });
            return documentToObject<DLApplication>(application);
        } catch (error) {
            console.error("Error creating application:", error);
            throw error;
        }
    }

    async updateApplicationCCStatus(
        id: string,
        status: string,
        remarks?: string
    ): Promise<DLApplication | undefined> {
        try {
            const updates: any = {
                ccStatus: status,
                ccDate: new Date(),
                ccRemarks: remarks || null,
            };

            // Get the application to check if we need to update overall status
            const app = await DLApplicationModel.findById(id);
            if (!app) return undefined;

            if (status === "rejected") {
                updates.overallStatus = "rejected";
            } else if (status === "approved") {
                // Only set to approved if this is a 1-day leave (only CC needed)
                if (app.numberOfDays === 1) {
                    updates.overallStatus = "approved";
                }
            }

            const application = await DLApplicationModel.findByIdAndUpdate(
                id,
                updates,
                { new: true }
            );
            return application
                ? documentToObject<DLApplication>(application)
                : undefined;
        } catch (error) {
            console.error("Error updating CC status:", error);
            return undefined;
        }
    }

    async updateApplicationHODStatus(
        id: string,
        status: string,
        remarks?: string
    ): Promise<DLApplication | undefined> {
        try {
            const updates: any = {
                hodStatus: status,
                hodDate: new Date(),
                hodRemarks: remarks || null,
            };

            // Get the application to check if we need to update overall status
            const app = await DLApplicationModel.findById(id);
            if (!app) return undefined;

            if (status === "rejected") {
                updates.overallStatus = "rejected";
            } else if (status === "approved") {
                // Only set to approved if this is a 2-day leave (only CC and HOD needed)
                if (app.numberOfDays === 2) {
                    updates.overallStatus = "approved";
                }
            }

            const application = await DLApplicationModel.findByIdAndUpdate(
                id,
                updates,
                { new: true }
            );
            return application
                ? documentToObject<DLApplication>(application)
                : undefined;
        } catch (error) {
            console.error("Error updating HOD status:", error);
            return undefined;
        }
    }

    async updateApplicationVPStatus(
        id: string,
        status: string,
        remarks?: string
    ): Promise<DLApplication | undefined> {
        try {
            const updates: any = {
                vpStatus: status,
                vpDate: new Date(),
                vpRemarks: remarks || null,
            };

            if (status === "rejected") {
                updates.overallStatus = "rejected";
            } else if (status === "approved") {
                // VP is the final approver for >2 day leaves
                updates.overallStatus = "approved";
            }

            const application = await DLApplicationModel.findByIdAndUpdate(
                id,
                updates,
                { new: true }
            );
            return application
                ? documentToObject<DLApplication>(application)
                : undefined;
        } catch (error) {
            console.error("Error updating VP status:", error);
            return undefined;
        }
    }
}
