import { useState, useEffect } from "react";
import { Plus, X, Calendar, AlertCircle, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getAllStudents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [openComboboxes, setOpenComboboxes] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const isEligible = attendancePercentage >= 75;

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getAllStudents();
      // Filter out current student and already added students, AND students with < 75% attendance
      setAvailableStudents(data.filter((s: any) =>
        s.rollNo !== studentRollNo && s.attendancePercentage >= 75
      ));
    } catch (error) {
      console.error("Failed to load students", error);
      toast({
        title: "Error",
        description: "Failed to load student list",
        variant: "destructive",
      });
    }
  };

  const addStudent = () => {
    setAdditionalStudents([
      ...additionalStudents,
      { id: Math.random().toString(), name: "", rollNo: "" },
    ]);
  };

  const removeStudent = (id: string) => {
    setAdditionalStudents(additionalStudents.filter((s) => s.id !== id));
  };

  const updateStudent = (id: string, rollNo: string) => {
    const selectedStudent = availableStudents.find((s) => s.rollNo === rollNo);
    if (selectedStudent) {
      setAdditionalStudents(
        additionalStudents.map((s) =>
          s.id === id
            ? { ...s, name: selectedStudent.name, rollNo: selectedStudent.rollNo }
            : s
        )
      );
      setOpenComboboxes((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleCombobox = (id: string, isOpen: boolean) => {
    setOpenComboboxes((prev) => ({ ...prev, [id]: isOpen }));
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
                <div className="flex-1">
                  <Popover
                    open={openComboboxes[student.id] || false}
                    onOpenChange={(open) => toggleCombobox(student.id, open)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openComboboxes[student.id] || false}
                        className="w-full justify-between"
                        data-testid={`select-student-${index}`}
                      >
                        {student.rollNo
                          ? availableStudents.find((s) => s.rollNo === student.rollNo)?.name + ` (${student.rollNo})`
                          : "Select Student..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search student..." />
                        <CommandList>
                          <CommandEmpty>No student found.</CommandEmpty>
                          <CommandGroup>
                            {availableStudents
                              .filter(
                                (s) =>
                                  !additionalStudents.some(
                                    (added) => added.rollNo === s.rollNo && added.id !== student.id
                                  )
                              )
                              .map((s) => (
                                <CommandItem
                                  key={s.id}
                                  value={`${s.name} ${s.rollNo}`}
                                  onSelect={() => updateStudent(student.id, s.rollNo)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      student.rollNo === s.rollNo ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {s.name} ({s.rollNo})
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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
