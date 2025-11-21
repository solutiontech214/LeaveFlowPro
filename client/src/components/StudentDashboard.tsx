import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ApplicationCard } from "./ApplicationCard";
import { ApplicationDetailsDialog } from "./ApplicationDetailsDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyApplications } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  division: string;
  numberOfDays: number;
  reason: string;
  dateFrom: string;
  dateTo: string;
  overallStatus: string;
  createdAt: string;
  additionalStudents?: string[] | null;

  // Approval tracking
  ccStatus: string;
  ccDate: string | null;
  ccRemarks: string | null;
  hodStatus: string;
  hodDate: string | null;
  hodRemarks: string | null;
  vpStatus: string;
  vpDate: string | null;
  vpRemarks: string | null;
}

interface StudentDashboardProps {
  onApplyClick: () => void;
  userId: string;
}

export function StudentDashboard({ onApplyClick, userId }: StudentDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, [userId]);

  const loadApplications = async () => {
    try {
      const data = await getMyApplications();
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

  const handleViewDetails = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      setSelectedApplication(app);
      setDetailsDialogOpen(true);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.overallStatus === "pending").length,
    approved: applications.filter((a) => a.overallStatus === "approved").length,
    rejected: applications.filter((a) => a.overallStatus === "rejected").length,
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
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Track and manage your duty leave applications</p>
        </div>
        <Button onClick={onApplyClick} data-testid="button-apply-leave">
          <Plus className="mr-2 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Applications" value={stats.total} icon={FileText} />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircle} />
        <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All Applications</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={mapApplication(app)}
                onView={handleViewDetails}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {applications.filter((a) => a.overallStatus === "pending").map((app) => (
            <ApplicationCard
              key={app.id}
              application={mapApplication(app)}
              onView={handleViewDetails}
            />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {applications.filter((a) => a.overallStatus === "approved").map((app) => (
            <ApplicationCard
              key={app.id}
              application={mapApplication(app)}
              onView={handleViewDetails}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
          {applications.filter((a) => a.overallStatus === "rejected").map((app) => (
            <ApplicationCard
              key={app.id}
              application={mapApplication(app)}
              onView={handleViewDetails}
            />
          ))}
        </TabsContent>
      </Tabs>

      <ApplicationDetailsDialog
        application={selectedApplication}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}
