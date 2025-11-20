import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StudentDashboard } from "@/components/StudentDashboard";
import { FacultyDashboard } from "@/components/FacultyDashboard";
import { DutyLeaveForm } from "@/components/DutyLeaveForm";
import { LoginPage } from "@/components/LoginPage";
import { useToast } from "@/hooks/use-toast";
import { login, logout, getCurrentUser, type User } from "@/lib/auth";
import { submitDLApplication } from "@/lib/api";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogin = async (email: string, password: string, role: "student" | "faculty") => {
    try {
      const { user: loggedInUser } = await login(email, password, role);
      setUser(loggedInUser);
      toast({
        title: "Login Successful",
        description: `Welcome ${loggedInUser.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowApplyForm(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleApplySubmit = async (formData: any) => {
    if (!user) return;

    try {
      // Format additional students to array of strings
      const additionalStudents = formData.additionalStudents
        .filter((s: any) => s.name && s.rollNo)
        .map((s: any) => `${s.name} (${s.rollNo})`);

      await submitDLApplication({
        studentId: user.id,
        studentName: user.name,
        rollNo: user.rollNo!,
        department: user.department!,
        division: user.division!,
        numberOfDays: parseInt(formData.numberOfDays),
        reason: formData.reason,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        additionalStudents: additionalStudents.length > 0 ? additionalStudents : undefined,
      });

      toast({
        title: "Application Submitted",
        description: "Your duty leave application has been submitted successfully.",
      });
      setShowApplyForm(false);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={user.name}
        userRole={user.role}
        facultyType={user.facultyType}
        rollNo={user.rollNo}
        department={user.department}
        division={user.division}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {user.role === "student" && !showApplyForm && (
          <StudentDashboard onApplyClick={() => setShowApplyForm(true)} userId={user.id} />
        )}
        {user.role === "student" && showApplyForm && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Apply for Duty Leave</h2>
              <p className="text-muted-foreground">Fill in the details to submit your application</p>
            </div>
            <DutyLeaveForm
              studentName={user.name}
              studentRollNo={user.rollNo!}
              department={user.department!}
              division={user.division!}
              attendancePercentage={user.attendancePercentage!}
              onSubmit={handleApplySubmit}
            />
          </div>
        )}
        {user.role === "faculty" && (
          <FacultyDashboard facultyType={user.facultyType!} department={user.department} />
        )}
      </main>
    </div>
  );
}
