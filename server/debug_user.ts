
import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function debugStudent() {
    try {
        console.log("Checking for student: rahul@institute.edu");
        const student = await storage.getStudentByEmail("rahul@institute.edu");

        if (!student) {
            console.log("❌ Student NOT FOUND in storage");
            // List all students to see who exists
            // Note: MemStorage doesn't expose getAllStudents directly in the interface usually, 
            // but let's see if we can infer or if we need to add a method.
            // For now, just reporting not found is enough.
        } else {
            console.log("✅ Student FOUND:", student.id, student.name, student.email);
            console.log("Stored Hash:", student.password);

            const testPass = "password123";
            const isMatch = await bcrypt.compare(testPass, student.password);
            console.log(`Password '${testPass}' match result: ${isMatch ? "✅ MATCH" : "❌ NO MATCH"}`);
        }
    } catch (err) {
        console.error("Debug script error:", err);
    }
}

debugStudent();
