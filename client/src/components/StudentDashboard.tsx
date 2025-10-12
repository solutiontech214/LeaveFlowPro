import { useState } from "react";
import { FileText, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ApplicationCard } from "./ApplicationCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//todo: remove mock functionality
const mockApplications = [
  {
    id: "1",
    studentName: "Rahul Sharma",
    rollNo: "CS21B001",
    department: "Computer Science",
    numberOfDays: 3,
    reason: "Attending National Level Hackathon at IIT Delhi",
    dateFrom: "2024-01-15",
    dateTo: "2024-01-17",
    status: "approved" as const,
    submittedDate: "2024-01-10",
    additionalStudents: ["Priya Patel", "Amit Kumar"],
  },
  {
    id: "2",
    studentName: "Rahul Sharma",
    rollNo: "CS21B001",
    department: "Computer Science",
    numberOfDays: 1,
    reason: "Industrial visit to Tech Park",
    dateFrom: "2024-01-20",
    dateTo: "2024-01-20",
    status: "pending" as const,
    submittedDate: "2024-01-18",
  },
  {
    id: "3",
    studentName: "Rahul Sharma",
    rollNo: "CS21B001",
    department: "Computer Science",
    numberOfDays: 2,
    reason: "Paper presentation at conference",
    dateFrom: "2023-12-10",
    dateTo: "2023-12-11",
    status: "rejected" as const,
    submittedDate: "2023-12-05",
  },
];

interface StudentDashboardProps {
  onApplyClick: () => void;
}

export function StudentDashboard({ onApplyClick }: StudentDashboardProps) {
  const [applications] = useState(mockApplications);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

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
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onView={(id) => console.log("View application:", id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="mt-6 space-y-4">
          {applications.filter((a) => a.status === "pending").map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onView={(id) => console.log("View application:", id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
          {applications.filter((a) => a.status === "approved").map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onView={(id) => console.log("View application:", id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
          {applications.filter((a) => a.status === "rejected").map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onView={(id) => console.log("View application:", id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
