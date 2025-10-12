import { useState } from "react";
import { Plus, X, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdditionalStudent {
  id: string;
  name: string;
  rollNo: string;
}

interface DutyLeaveFormProps {
  studentName: string;
  studentRollNo: string;
  department: string;
  division: string;
  attendancePercentage: number;
  onSubmit: (data: any) => void;
}

export function DutyLeaveForm({
  studentName,
  studentRollNo,
  department,
  division,
  attendancePercentage,
  onSubmit,
}: DutyLeaveFormProps) {
  const [numberOfDays, setNumberOfDays] = useState("");
  const [reason, setReason] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [additionalStudents, setAdditionalStudents] = useState<AdditionalStudent[]>([]);

  const isEligible = attendancePercentage >= 75;

  const addStudent = () => {
    setAdditionalStudents([
      ...additionalStudents,
      { id: Math.random().toString(), name: "", rollNo: "" },
    ]);
  };

  const removeStudent = (id: string) => {
    setAdditionalStudents(additionalStudents.filter((s) => s.id !== id));
  };

  const updateStudent = (id: string, field: "name" | "rollNo", value: string) => {
    setAdditionalStudents(
      additionalStudents.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      numberOfDays,
      reason,
      dateFrom,
      dateTo,
      additionalStudents,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for Duty Leave</CardTitle>
        <CardDescription>
          Fill in the details below to submit your duty leave application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={studentName} disabled data-testid="input-student-name" />
            </div>
            <div className="space-y-2">
              <Label>Roll Number</Label>
              <Input value={studentRollNo} disabled data-testid="input-student-roll" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={department} disabled data-testid="input-department" />
            </div>
            <div className="space-y-2">
              <Label>Division</Label>
              <Input value={division} disabled data-testid="input-division" />
            </div>
          </div>

          <Alert className={isEligible ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}>
            <AlertCircle className={`h-4 w-4 ${isEligible ? "text-success" : "text-destructive"}`} />
            <AlertDescription className={isEligible ? "text-success" : "text-destructive"}>
              Attendance: {attendancePercentage}% - {isEligible ? "Eligible to apply" : "Not eligible (minimum 75% required)"}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days *</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(e.target.value)}
                required
                disabled={!isEligible}
                data-testid="input-number-of-days"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date *</Label>
              <Input
                id="from-date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
                disabled={!isEligible}
                data-testid="input-date-from"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date *</Label>
              <Input
                id="to-date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
                disabled={!isEligible}
                data-testid="input-date-to"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Purpose/Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Enter the reason for duty leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              disabled={!isEligible}
              rows={3}
              data-testid="input-reason"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Additional Students (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStudent}
                disabled={!isEligible}
                data-testid="button-add-student"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>

            {additionalStudents.map((student, index) => (
              <div key={student.id} className="flex gap-2" data-testid={`additional-student-${index}`}>
                <Input
                  placeholder="Student Name"
                  value={student.name}
                  onChange={(e) => updateStudent(student.id, "name", e.target.value)}
                  className="flex-1"
                  data-testid={`input-additional-name-${index}`}
                />
                <Input
                  placeholder="Roll No"
                  value={student.rollNo}
                  onChange={(e) => updateStudent(student.id, "rollNo", e.target.value)}
                  className="flex-1"
                  data-testid={`input-additional-roll-${index}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStudent(student.id)}
                  data-testid={`button-remove-student-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={!isEligible} data-testid="button-submit-application">
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
