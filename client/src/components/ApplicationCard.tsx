import { Calendar, User, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";

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

interface ApplicationCardProps {
  application: Application;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (id: string) => void;
}

export function ApplicationCard({
  application,
  showActions = false,
  onApprove,
  onReject,
  onView,
}: ApplicationCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-application-${application.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold" data-testid={`text-student-name-${application.id}`}>{application.studentName}</h3>
              <p className="text-sm text-muted-foreground">{application.rollNo} • {application.department}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{application.dateFrom} to {application.dateTo}</span>
          <Badge variant="secondary" className="ml-auto">
            {application.numberOfDays} {application.numberOfDays === 1 ? "day" : "days"}
          </Badge>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="flex-1 text-muted-foreground">{application.reason}</p>
        </div>
        {application.additionalStudents && application.additionalStudents.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              +{application.additionalStudents.length} additional {application.additionalStudents.length === 1 ? "student" : "students"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Submitted on {application.submittedDate}</span>
        </div>
      </CardContent>
      {showActions && application.status === "pending" && (
        <CardFooter className="flex flex-col gap-2 pt-4">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onReject?.(application.id)}
              data-testid={`button-reject-${application.id}`}
            >
              Reject
            </Button>
            <Button
              className="flex-1"
              onClick={() => onApprove?.(application.id)}
              data-testid={`button-approve-${application.id}`}
            >
              Approve
            </Button>
          </div>
          <Button
            variant="ghost"
            className="w-full h-8 text-muted-foreground"
            onClick={() => onView?.(application.id)}
            data-testid={`button-view-${application.id}`}
          >
            View Details
          </Button>
        </CardFooter>
      )}
      {!showActions && (
        <CardFooter className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onView?.(application.id)}
            data-testid={`button-view-${application.id}`}
          >
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

