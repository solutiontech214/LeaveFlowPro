import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ApplicationCard } from "./ApplicationCard";
import { AttendanceUpload } from "./AttendanceUpload";
import { StudentImport } from "./StudentImport";
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
import { getPendingApplications, getAllApplications, approveOrRejectApplication } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  numberOfDays: number;
  reason: string;
  dateFrom: string;
  dateTo: string;
  overallStatus: string;
  createdAt: string;
  additionalStudents?: string[] | null;
}

interface FacultyDashboardProps {
  facultyType: "CC" | "HOD" | "VP";
  department?: string;
}

export function FacultyDashboard({ facultyType, department }: FacultyDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, [facultyType]);

  const loadApplications = async () => {
    try {
      const data = await getAllApplications();
      setApplications(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending: applications.filter((a) => a.overallStatus === "pending").length,
    approved: applications.filter((a) => a.overallStatus === "approved").length,
    rejected: applications.filter((a) => a.overallStatus === "rejected").length,
  };

  const handleAction = (id: string, type: "approve" | "reject") => {
    setSelectedApp(id);
    setAction(type);
  };

  const confirmAction = async () => {
    if (selectedApp && action) {
      try {
        await approveOrRejectApplication(selectedApp, action, remarks);
        toast({
          title: action === "approve" ? "Application Approved" : "Application Rejected",
          description: `The application has been ${action}d successfully.`,
        });

        // Reload applications
        await loadApplications();

        setSelectedApp(null);
        setAction(null);
        setRemarks("");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to process application",
          variant: "destructive",
        });
      }
    }
  };

  const facultyLabels = {
    CC: "Class Coordinator",
    HOD: "Head of Department",
    VP: "Vice Principal",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const mapApplication = (app: Application) => ({
    ...app,
    status: app.overallStatus as "pending" | "approved" | "rejected",
    submittedDate: formatDate(app.createdAt),
    additionalStudents: app.additionalStudents || undefined,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">Faculty Dashboard</h2>
            <Badge variant="secondary" className="text-sm">
              {facultyLabels[facultyType]}
            </Badge>
            {department && facultyType !== "VP" && (
              <Badge variant="outline" className="text-sm">
                {department}
              </Badge>
            )}
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
          <TabsTrigger value="attendance" data-testid="tab-faculty-attendance">Attendance</TabsTrigger>
          <TabsTrigger value="import" data-testid="tab-faculty-import">Import Students</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {applications.filter((a) => a.overallStatus === "pending").length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No pending applications</p>
            </div>
          ) : (
            applications
              .filter((a) => a.overallStatus === "pending")
              .map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={mapApplication(app)}
                  showActions
                  onApprove={(id) => handleAction(id, "approve")}
                  onReject={(id) => handleAction(id, "reject")}
                />
              ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {applications
            .filter((a) => a.overallStatus === "approved")
            .map((app) => (
              <ApplicationCard key={app.id} application={mapApplication(app)} />
            ))}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
          {applications
            .filter((a) => a.overallStatus === "rejected")
            .map((app) => (
              <ApplicationCard key={app.id} application={mapApplication(app)} />
            ))}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceUpload />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <StudentImport />
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
