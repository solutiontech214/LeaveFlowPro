import mongoose, { Schema } from "mongoose";
import type { Student, Faculty, DLApplication } from "@shared/schema";

// Student Schema
const studentSchema = new Schema({
    name: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    division: { type: String, required: true },
    attendancePercentage: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export const StudentModel = mongoose.model("Student", studentSchema);

// Faculty Schema
const facultySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }, // 'CC', 'HOD', 'VP'
    department: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const FacultyModel = mongoose.model("Faculty", facultySchema);

// DL Application Schema
const dlApplicationSchema = new Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    department: { type: String, required: true },
    division: { type: String, required: true },
    numberOfDays: { type: Number, required: true },
    reason: { type: String, required: true },
    dateFrom: { type: String, required: true },
    dateTo: { type: String, required: true },
    additionalStudents: { type: [String], default: null },

    // Approval tracking
    ccStatus: { type: String, default: "pending" },
    ccDate: { type: Date, default: null },
    ccRemarks: { type: String, default: null },

    hodStatus: { type: String, default: "pending" },
    hodDate: { type: Date, default: null },
    hodRemarks: { type: String, default: null },

    vpStatus: { type: String, default: "pending" },
    vpDate: { type: Date, default: null },
    vpRemarks: { type: String, default: null },

    overallStatus: { type: String, required: true, default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

// Add indexes for faster queries
dlApplicationSchema.index({ studentId: 1 });
dlApplicationSchema.index({ department: 1 });
dlApplicationSchema.index({ overallStatus: 1 });
dlApplicationSchema.index({ ccStatus: 1 });
dlApplicationSchema.index({ hodStatus: 1 });
dlApplicationSchema.index({ vpStatus: 1 });

export const DLApplicationModel = mongoose.model(
    "DLApplication",
    dlApplicationSchema
);

// Helper function to convert MongoDB document to application type
export function documentToObject<T>(doc: any): T {
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj as T;
}
