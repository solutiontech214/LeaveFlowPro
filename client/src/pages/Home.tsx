import { useState } from "react";
import { Header } from "@/components/Header";
import { StudentDashboard } from "@/components/StudentDashboard";
import { FacultyDashboard } from "@/components/FacultyDashboard";
import { DutyLeaveForm } from "@/components/DutyLeaveForm";
import { LoginPage } from "@/components/LoginPage";
import { useToast } from "@/hooks/use-toast";

//todo: remove mock functionality
type UserRole = "student" | "faculty";
type FacultyType = "CC" | "HOD" | "VP";

interface User {
  name: string;
  email: string;
  role: UserRole;
  facultyType?: FacultyType;
  rollNo?: string;
  department?: string;
  division?: string;
  attendancePercentage?: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const { toast } = useToast();

  const handleLogin = (email: string, password: string, role: UserRole) => {
    //todo: remove mock functionality
    if (role === "student") {
      setUser({
        name: "Rahul Sharma",
        email,
        role: "student",
        rollNo: "CS21B001",
        department: "Computer Science",
        division: "A",
        attendancePercentage: 82,
      });
    } else {
      setUser({
        name: "Dr. Anjali Desai",
        email,
        role: "faculty",
        facultyType: "CC",
      });
    }
    toast({
      title: "Login Successful",
      description: `Welcome ${role === "student" ? "Rahul Sharma" : "Dr. Anjali Desai"}!`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setShowApplyForm(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleApplySubmit = (data: any) => {
    console.log("Application submitted:", data);
    toast({
      title: "Application Submitted",
      description: "Your duty leave application has been submitted successfully.",
    });
    setShowApplyForm(false);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={user.name}
        userRole={user.role}
        facultyType={user.facultyType}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {user.role === "student" && !showApplyForm && (
          <StudentDashboard onApplyClick={() => setShowApplyForm(true)} />
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
          <FacultyDashboard facultyType={user.facultyType!} />
        )}
      </main>
    </div>
  );
}
