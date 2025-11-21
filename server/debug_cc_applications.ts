import { storage } from "./storage";

console.log("=== Debugging CC Dashboard Application Visibility ===\n");

async function debugApplications() {
    // Get all students
    console.log("--- STUDENTS ---");
    const allStudents = Array.from((storage as any).students.values());
    console.log(`Total students: ${allStudents.length}\n`);

    if (allStudents.length > 0) {
        console.log("Sample student data:");
        allStudents.slice(0, 3).forEach((student: any) => {
            console.log(`  - ${student.name} (${student.rollNo})`);
            console.log(`    Email: ${student.email}`);
            console.log(`    Department: "${student.department}"`);
            console.log(`    Division: ${student.division}\n`);
        });
    }

    // Get unique departments from students
    const studentDepartments = [...new Set(allStudents.map((s: any) => s.department))];
    console.log(`Student departments: ${studentDepartments.join(", ")}\n`);

    // Get all faculty
    console.log("--- FACULTY ---");
    const allFaculty = Array.from((storage as any).faculty.values());
    console.log(`Total faculty: ${allFaculty.length}\n`);

    const ccFaculty = allFaculty.filter((f: any) => f.role === "CC");
    console.log(`Class Coordinators (${ccFaculty.length}):`);
    ccFaculty.forEach((faculty: any) => {
        console.log(`  - ${faculty.name} (${faculty.role})`);
        console.log(`    Email: ${faculty.email}`);
        console.log(`    Department: "${faculty.department}"\n`);
    });

    // Get unique departments from faculty
    const facultyDepartments = [...new Set(allFaculty.map((f: any) => f.department))];
    console.log(`Faculty departments: ${facultyDepartments.join(", ")}\n`);

    // Get all applications
    console.log("--- APPLICATIONS ---");
    const allApplications = Array.from((storage as any).applications.values());
    console.log(`Total applications: ${allApplications.length}\n`);

    if (allApplications.length > 0) {
        console.log("Application details:");
        allApplications.forEach((app: any) => {
            console.log(`  - Application ID: ${app.id}`);
            console.log(`    Student: ${app.studentName} (${app.rollNo})`);
            console.log(`    Department: "${app.department}"`);
            console.log(`    Division: ${app.division}`);
            console.log(`    Days: ${app.numberOfDays}`);
            console.log(`    Overall Status: ${app.overallStatus}`);
            console.log(`    CC Status: ${app.ccStatus}`);
            console.log(`    HOD Status: ${app.hodStatus}`);
            console.log(`    VP Status: ${app.vpStatus}\n`);
        });

        // Get unique departments from applications
        const appDepartments = [...new Set(allApplications.map((a: any) => a.department))];
        console.log(`Application departments: ${appDepartments.join(", ")}\n`);
    }

    // Check for department mismatches
    console.log("--- DEPARTMENT MATCH ANALYSIS ---");
    studentDepartments.forEach(dept => {
        const exactMatch = facultyDepartments.includes(dept);
        const caseInsensitiveMatch = facultyDepartments.some(
            fd => fd.toLowerCase() === dept.toLowerCase()
        );

        console.log(`Student department "${dept}":`);
        console.log(`  - Exact match with faculty: ${exactMatch}`);
        console.log(`  - Case-insensitive match: ${caseInsensitiveMatch}`);

        if (!exactMatch && caseInsensitiveMatch) {
            const matchingFacultyDept = facultyDepartments.find(
                fd => fd.toLowerCase() === dept.toLowerCase()
            );
            console.log(`  ⚠️ MISMATCH: Student has "${dept}" but faculty has "${matchingFacultyDept}"`);
        }
        console.log();
    });

    // Test CC filtering
    if (ccFaculty.length > 0 && allApplications.length > 0) {
        console.log("--- CC FILTER TEST ---");
        const testCC = ccFaculty[0];
        console.log(`Testing with CC: ${testCC.name} (Department: "${testCC.department}")\n`);

        const pendingForCC = await storage.getPendingApplicationsForCC(testCC.department);
        console.log(`Applications visible to this CC: ${pendingForCC.length}`);

        if (pendingForCC.length === 0) {
            console.log("❌ NO APPLICATIONS FOUND FOR CC\n");

            // Show why applications don't match
            console.log("Checking why applications don't match:");
            allApplications.forEach((app: any) => {
                const deptMatch = app.department === testCC.department;
                const ccStatusMatch = app.ccStatus === "pending";
                const overallStatusMatch = app.overallStatus === "pending";

                console.log(`  Application ${app.id}:`);
                console.log(`    - Department match: ${deptMatch} ("${app.department}" === "${testCC.department}")`);
                console.log(`    - CC status is pending: ${ccStatusMatch} (${app.ccStatus})`);
                console.log(`    - Overall status is pending: ${overallStatusMatch} (${app.overallStatus})`);
                console.log(`    - Should be visible: ${deptMatch && ccStatusMatch && overallStatusMatch}\n`);
            });
        } else {
            console.log("✅ Applications found!");
            pendingForCC.forEach((app: any) => {
                console.log(`  - ${app.studentName}: ${app.reason} (${app.numberOfDays} days)`);
            });
        }
    }
}

debugApplications().catch(console.error);
