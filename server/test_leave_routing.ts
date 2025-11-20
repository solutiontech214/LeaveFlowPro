
// Using native fetch in Node 18+

const BASE_URL = "http://localhost:5000/api";

// Credentials
const STUDENT = { email: "rahul@institute.edu", password: "password123" };
const CC = { email: "anjali.cc@institute.edu", password: "faculty123" };
const HOD = { email: "rajesh.hod@institute.edu", password: "faculty123" };
const VP = { email: "sunita.vp@institute.edu", password: "faculty123" };

async function login(creds: any) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creds, role: creds === STUDENT ? "student" : "faculty" }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(`Login failed for ${creds.email}: ${data.error}`);
    return { token: data.token, user: data.user };
}

async function applyForLeave(token: string, user: any, days: number) {
    const payload = {
        studentId: user.id,
        studentName: user.name,
        rollNo: user.rollNo || "UNKNOWN",
        department: user.department,
        division: user.division || "A",
        numberOfDays: days,
        reason: `Test ${days} day(s) leave`,
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
        additionalStudents: []
    };

    const res = await fetch(`${BASE_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(`Apply failed: ${data.error}`);
    return data.id;
}

async function approveLeave(token: string, appId: string, role: string) {
    const res = await fetch(`${BASE_URL}/applications/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ applicationId: appId, action: "approve", remarks: `${role} Approved` }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(`${role} Approve failed: ${data.error}`);
    return data;
}

async function checkStatus(token: string, appId: string) {
    const res = await fetch(`${BASE_URL}/applications/my`, {
        headers: { "Authorization": `Bearer ${token}` },
    });
    const data: any = await res.json();
    if (!Array.isArray(data)) {
        console.error("checkStatus failed, expected array but got:", data);
        return null;
    }
    console.log(`DEBUG: checkStatus found ${data.length} apps. IDs: ${data.map((a: any) => a.id).join(", ")}`);
    const app = data.find((a: any) => a.id === appId);
    if (!app) {
        console.error(`Application ${appId} not found in student's list. Available IDs:`, data.map((a: any) => a.id));
    }
    return app;
}

async function runTests() {
    try {
        console.log("Logging in users...");
        const studentAuth = await login(STUDENT);
        const studentToken = studentAuth.token;
        const studentUser = studentAuth.user;

        const ccAuth = await login(CC);
        const ccToken = ccAuth.token;

        const hodAuth = await login(HOD);
        const hodToken = hodAuth.token;

        const vpAuth = await login(VP);
        const vpToken = vpAuth.token;

        console.log("\n--- TEST CASE 1: 1 Day Leave (CC Only) ---");
        const app1Id = await applyForLeave(studentToken, studentUser, 1);
        console.log(`Applied for 1 day leave (ID: ${app1Id})`);

        let app1 = await checkStatus(studentToken, app1Id);
        if (!app1) throw new Error("App1 not found");
        console.log(`Initial Status: CC=${app1.ccStatus}, HOD=${app1.hodStatus}, VP=${app1.vpStatus}, Overall=${app1.overallStatus}`);

        await approveLeave(ccToken, app1Id, "CC");
        console.log("CC Approved");

        app1 = await checkStatus(studentToken, app1Id);
        if (!app1) throw new Error("App1 not found after approval");
        console.log(`Final Status: CC=${app1.ccStatus}, HOD=${app1.hodStatus}, VP=${app1.vpStatus}, Overall=${app1.overallStatus}`);

        if (app1.overallStatus === "approved") console.log("✅ 1 Day Leave Test PASSED");
        else console.log("❌ 1 Day Leave Test FAILED");


        console.log("\n--- TEST CASE 2: 2 Days Leave (CC + HOD) ---");
        const app2Id = await applyForLeave(studentToken, studentUser, 2);
        console.log(`Applied for 2 days leave (ID: ${app2Id})`);

        let app2 = await checkStatus(studentToken, app2Id);
        if (!app2) throw new Error("App2 not found");
        console.log(`Initial Status: CC=${app2.ccStatus}, HOD=${app2.hodStatus}, VP=${app2.vpStatus}`);

        await approveLeave(ccToken, app2Id, "CC");
        console.log("CC Approved");

        app2 = await checkStatus(studentToken, app2Id);
        if (!app2) throw new Error("App2 not found after CC approval");
        console.log(`Status after CC: CC=${app2.ccStatus}, HOD=${app2.hodStatus}, VP=${app2.vpStatus}, Overall=${app2.overallStatus}`);

        await approveLeave(hodToken, app2Id, "HOD");
        console.log("HOD Approved");

        app2 = await checkStatus(studentToken, app2Id);
        if (!app2) throw new Error("App2 not found after HOD approval");
        console.log(`Final Status: CC=${app2.ccStatus}, HOD=${app2.hodStatus}, VP=${app2.vpStatus}, Overall=${app2.overallStatus}`);

        if (app2.overallStatus === "approved") console.log("✅ 2 Days Leave Test PASSED");
        else console.log("❌ 2 Days Leave Test FAILED");


        console.log("\n--- TEST CASE 3: 3 Days Leave (CC + HOD + VP) ---");
        const app3Id = await applyForLeave(studentToken, studentUser, 3);
        console.log(`Applied for 3 days leave (ID: ${app3Id})`);

        let app3 = await checkStatus(studentToken, app3Id);
        if (!app3) throw new Error("App3 not found");
        console.log(`Initial Status: CC=${app3.ccStatus}, HOD=${app3.hodStatus}, VP=${app3.vpStatus}`);

        await approveLeave(ccToken, app3Id, "CC");
        console.log("CC Approved");

        app3 = await checkStatus(studentToken, app3Id);
        if (!app3) throw new Error("App3 not found after CC approval");
        console.log(`Status after CC: CC=${app3.ccStatus}, HOD=${app3.hodStatus}, VP=${app3.vpStatus}`);

        await approveLeave(hodToken, app3Id, "HOD");
        console.log("HOD Approved");

        app3 = await checkStatus(studentToken, app3Id);
        if (!app3) throw new Error("App3 not found after HOD approval");
        console.log(`Status after HOD: CC=${app3.ccStatus}, HOD=${app3.hodStatus}, VP=${app3.vpStatus}, Overall=${app3.overallStatus}`);

        await approveLeave(vpToken, app3Id, "VP");
        console.log("VP Approved");

        app3 = await checkStatus(studentToken, app3Id);
        if (!app3) throw new Error("App3 not found after VP approval");
        console.log(`Final Status: CC=${app3.ccStatus}, HOD=${app3.hodStatus}, VP=${app3.vpStatus}, Overall=${app3.overallStatus}`);

        if (app3.overallStatus === "approved") console.log("✅ 3 Days Leave Test PASSED");
        else console.log("❌ 3 Days Leave Test FAILED");

    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTests();
