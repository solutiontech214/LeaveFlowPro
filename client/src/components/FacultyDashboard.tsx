import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ApplicationCard } from "./ApplicationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

//todo: remove mock functionality
interface Application {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  numberOfDays: number;
  reason: string;
  dateFrom: string;
  dateTo: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  additionalStudents?: string[];
}

const mockApplications: Application[] = [
  {
    id: "1",
    studentName: "Priya Patel",
    rollNo: "EC21B015",
    department: "Electronics",
    numberOfDays: 1,
    reason: "Attending workshop on IoT at Tech Hub",
    dateFrom: "2024-01-22",
    dateTo: "2024-01-22",
    status: "pending",
    submittedDate: "2024-01-20",
  },
  {
    id: "2",
    studentName: "Amit Kumar",
    rollNo: "ME21B042",
    department: "Mechanical",
    numberOfDays: 2,
    reason: "Industrial training at Manufacturing Plant",
    dateFrom: "2024-01-25",
    dateTo: "2024-01-26",
    status: "pending",
    submittedDate: "2024-01-19",
    additionalStudents: ["Rohit Singh"],
  },
  {
    id: "3",
    studentName: "Sneha Reddy",
    rollNo: "CS21B028",
    department: "Computer Science",
    numberOfDays: 1,
    reason: "Seminar on AI/ML at University",
    dateFrom: "2024-01-18",
    dateTo: "2024-01-18",
    status: "approved",
    submittedDate: "2024-01-15",
  },
  {
    id: "4",
    studentName: "Vikram Shah",
    rollNo: "EC21B033",
    department: "Electronics",
    numberOfDays: 1,
    reason: "Personal reasons",
    dateFrom: "2024-01-16",
    dateTo: "2024-01-16",
    status: "rejected",
    submittedDate: "2024-01-14",
  },
];

interface FacultyDashboardProps {
  facultyType: "CC" | "HOD" | "VP";
}

export function FacultyDashboard({ facultyType }: FacultyDashboardProps) {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");

  const stats = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleAction = (id: string, type: "approve" | "reject") => {
    setSelectedApp(id);
    setAction(type);
  };

  const confirmAction = () => {
    if (selectedApp && action) {
      setApplications(
        applications.map((app) =>
          app.id === selectedApp
            ? { ...app, status: action === "approve" ? "approved" : "rejected" }
            : app
        )
      );
      console.log(`${action} application ${selectedApp} with remarks:`, remarks);
      setSelectedApp(null);
      setAction(null);
      setRemarks("");
    }
  };

  const facultyLabels = {
    CC: "Class Coordinator",
    HOD: "Head of Department",
    VP: "Vice Principal",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Faculty Dashboard</h2>
            <Badge variant="secondary" className="text-sm">
              {facultyLabels[facultyType]}
            </Badge>
          </div>
          <p className="text-muted-foreground">Review and manage duty leave applications</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Pending Review" value={stats.pending} icon={Clock} />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircle} />
        <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-faculty-pending">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-faculty-approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-faculty-rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {applications.filter((a) => a.status === "pending").length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No pending applications</p>
            </div>
          ) : (
            applications
              .filter((a) => a.status === "pending")
              .map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  showActions
                  onApprove={(id) => handleAction(id, "approve")}
                  onReject={(id) => handleAction(id, "reject")}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {applications
            .filter((a) => a.status === "approved")
            .map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
          {applications
            .filter((a) => a.status === "rejected")
            .map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!action} onOpenChange={() => {
        setAction(null);
        setSelectedApp(null);
        setRemarks("");
      }}>
        <DialogContent data-testid="dialog-action">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "You are about to approve this duty leave application."
                : "You are about to reject this duty leave application."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder="Add any comments or reasons..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              data-testid="input-remarks"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAction(null);
              setSelectedApp(null);
              setRemarks("");
            }} data-testid="button-cancel-action">
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              variant={action === "approve" ? "default" : "destructive"}
              data-testid="button-confirm-action"
            >
              Confirm {action === "approve" ? "Approval" : "Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
