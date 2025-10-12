import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingStudent = await storage.getStudentByEmail("rahul@institute.edu");
    if (existingStudent) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Create students with different attendance
    const students = [
      {
        name: "Rahul Sharma",
        rollNo: "CS21B001",
        email: "rahul@institute.edu",
        password: await bcrypt.hash("password123", 10),
        department: "Computer Science",
        division: "A",
        attendancePercentage: 82,
      },
      {
        name: "Priya Patel",
        rollNo: "EC21B015",
        email: "priya@institute.edu",
        password: await bcrypt.hash("password123", 10),
        department: "Electronics",
        division: "B",
        attendancePercentage: 78,
      },
      {
        name: "Amit Kumar",
        rollNo: "ME21B042",
        email: "amit@institute.edu",
        password: await bcrypt.hash("password123", 10),
        department: "Mechanical",
        division: "A",
        attendancePercentage: 88,
      },
      {
        name: "Sneha Reddy",
        rollNo: "CS21B028",
        email: "sneha@institute.edu",
        password: await bcrypt.hash("password123", 10),
        department: "Computer Science",
        division: "A",
        attendancePercentage: 91,
      },
      {
        name: "Vikram Shah",
        rollNo: "EC21B033",
        email: "vikram@institute.edu",
        password: await bcrypt.hash("password123", 10),
        department: "Electronics",
        division: "B",
        attendancePercentage: 65, // Below 75%, not eligible
      },
    ];

    for (const student of students) {
      await storage.createStudent(student);
    }

    // Create faculty members
    const facultyMembers = [
      {
        name: "Dr. Anjali Desai",
        email: "anjali.cc@institute.edu",
        password: await bcrypt.hash("faculty123", 10),
        role: "CC",
        department: "Computer Science",
      },
      {
        name: "Prof. Rajesh Mehta",
        email: "rajesh.hod@institute.edu",
        password: await bcrypt.hash("faculty123", 10),
        role: "HOD",
        department: "Computer Science",
      },
      {
        name: "Dr. Sunita Iyer",
        email: "sunita.vp@institute.edu",
        password: await bcrypt.hash("faculty123", 10),
        role: "VP",
        department: "Administration",
      },
      {
        name: "Dr. Kiran Kulkarni",
        email: "kiran.cc@institute.edu",
        password: await bcrypt.hash("faculty123", 10),
        role: "CC",
        department: "Electronics",
      },
      {
        name: "Prof. Anil Joshi",
        email: "anil.hod@institute.edu",
        password: await bcrypt.hash("faculty123", 10),
        role: "HOD",
        department: "Electronics",
      },
    ];

    for (const faculty of facultyMembers) {
      await storage.createFaculty(faculty);
    }

    console.log("Database seeded successfully!");
    console.log("\nTest Credentials:");
    console.log("\nStudents (password: password123):");
    console.log("- rahul@institute.edu (CS, 82% attendance)");
    console.log("- priya@institute.edu (EC, 78% attendance)");
    console.log("- sneha@institute.edu (CS, 91% attendance)");
    console.log("- vikram@institute.edu (EC, 65% attendance - NOT ELIGIBLE)");
    console.log("\nFaculty (password: faculty123):");
    console.log("- anjali.cc@institute.edu (CC - Computer Science)");
    console.log("- rajesh.hod@institute.edu (HOD - Computer Science)");
    console.log("- sunita.vp@institute.edu (Vice Principal)");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
