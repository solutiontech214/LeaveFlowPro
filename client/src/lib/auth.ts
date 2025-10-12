export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty";
  rollNo?: string;
  department?: string;
  division?: string;
  attendancePercentage?: number;
  facultyType?: "CC" | "HOD" | "VP";
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function login(
  email: string,
  password: string,
  role: "student" | "faculty"
): Promise<{ user: User; token: string }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch("/api/auth/me", {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    removeToken();
    return null;
  }
}

export function logout(): void {
  removeToken();
}
