
import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function debugStudent() {
    try {
        const email = "aarav.sharma@institute.edu";
        console.log(`Checking for student: ${email}`);
        const student = await storage.getStudentByEmail(email);

        if (!student) {
            console.log("❌ Student NOT FOUND in storage");
        } else {
            console.log("✅ Student FOUND:", student.id, student.name, student.email);
            console.log("Stored Hash:", student.password);

            const testPass = "Student@123";
            const isMatch = await bcrypt.compare(testPass, student.password);
            console.log(`Password '${testPass}' match result: ${isMatch ? "✅ MATCH" : "❌ NO MATCH"}`);
        }
    } catch (err) {
        console.error("Debug script error:", err);
    }
}

debugStudent();
