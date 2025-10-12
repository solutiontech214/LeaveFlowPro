import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoginPageProps {
  onLogin: (email: string, password: string, role: "student" | "faculty") => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(studentEmail, studentPassword, "student");
  };

  const handleFacultyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(facultyEmail, facultyPassword, "faculty");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold">Duty Leave Management</h1>
          <p className="mt-2 text-muted-foreground">
            Institute Online Portal
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" data-testid="tab-student">Student Login</TabsTrigger>
            <TabsTrigger value="faculty" data-testid="tab-faculty">Faculty Login</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Portal</CardTitle>
                <CardDescription>
                  Sign in with your institute email to apply for duty leave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@institute.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      required
                      data-testid="input-student-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                      data-testid="input-student-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-student-login">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Portal</CardTitle>
                <CardDescription>
                  Sign in to review and manage duty leave applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFacultyLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="faculty-email">Email</Label>
                    <Input
                      id="faculty-email"
                      type="email"
                      placeholder="faculty@institute.edu"
                      value={facultyEmail}
                      onChange={(e) => setFacultyEmail(e.target.value)}
                      required
                      data-testid="input-faculty-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faculty-password">Password</Label>
                    <Input
                      id="faculty-password"
                      type="password"
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      required
                      data-testid="input-faculty-password"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-faculty-login">
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
