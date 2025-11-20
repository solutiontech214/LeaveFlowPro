import { getAuthHeaders } from "./auth";

export async function submitDLApplication(data: {
  studentId: string;
  studentName: string;
  rollNo: string;
  department: string;
  division: string;
  numberOfDays: number;
  reason: string;
  dateFrom: string;
  dateTo: string;
  additionalStudents?: string[];
}) {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit application");
  }

  return response.json();
}

export async function getMyApplications() {
  const response = await fetch("/api/applications/my", {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export async function getPendingApplications() {
  const response = await fetch("/api/applications/pending", {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pending applications");
  }

  return response.json();
}

export async function getAllApplications(status?: string) {
  const url = status
    ? `/api/applications/all?status=${status}`
    : "/api/applications/all";

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export async function approveOrRejectApplication(
  applicationId: string,
  action: "approve" | "reject",
  remarks?: string
) {
  const response = await fetch("/api/applications/approve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ applicationId, action, remarks }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process application");
  }

  return response.json();
}

export async function uploadAttendance(
  attendanceData: { rollNo: string; attendancePercentage: number }[]
) {
  const response = await fetch("/api/attendance/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ attendanceData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload attendance");
  }

  return response.json();
}

export async function importStudents(
  students: {
    name: string;
    email: string;
    password: string;
    department: string;
    division: string;
    rollNo: string;
    attendancePercentage: number;
  }[]
) {
  const response = await fetch("/api/students/bulk-import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ students }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to import students");
  }

  return response.json();
}
