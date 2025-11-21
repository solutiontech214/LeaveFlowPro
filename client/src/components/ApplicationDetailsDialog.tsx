import { CheckCircle, XCircle, Clock, User, Calendar, FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";

interface ApplicationDetails {
    id: string;
    studentName: string;
    rollNo: string;
    department: string;
    division: string;
    numberOfDays: number;
    reason: string;
    dateFrom: string;
    dateTo: string;
    additionalStudents?: string[] | null;
    overallStatus: string;
    createdAt: string;

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

interface ApplicationDetailsDialogProps {
    application: ApplicationDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailsDialog({
    application,
    open,
    onOpenChange,
}: ApplicationDetailsDialogProps) {
    if (!application) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "rejected":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            default:
                return "text-yellow-600";
        }
    };

    // Determine which approvals are required based on numberOfDays
    const requiresCC = true; // Always required
    const requiresHOD = application.numberOfDays >= 2;
    const requiresVP = application.numberOfDays > 2;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Application Details
                        <StatusBadge status={application.overallStatus as any} />
                    </DialogTitle>
                    <DialogDescription>
                        Complete details and approval status for this leave application
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Student Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                            Student Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Name</p>
                                <p className="font-medium">{application.studentName}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Roll Number</p>
                                <p className="font-medium">{application.rollNo}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Department</p>
                                <p className="font-medium">{application.department}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Division</p>
                                <p className="font-medium">{application.division}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Leave Details */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                            Leave Details
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">From:</span>
                                <span className="font-medium">{formatDate(application.dateFrom)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">To:</span>
                                <span className="font-medium">{formatDate(application.dateTo)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Duration:</span>
                                <Badge variant="secondary">
                                    {application.numberOfDays} {application.numberOfDays === 1 ? "day" : "days"}
                                </Badge>
                            </div>
                            <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-muted-foreground mb-1">Reason:</p>
                                    <p className="font-medium">{application.reason}</p>
                                </div>
                            </div>
                            {application.additionalStudents && application.additionalStudents.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-muted-foreground mb-1">Additional Students:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {application.additionalStudents.map((student, idx) => (
                                                <Badge key={idx} variant="outline">
                                                    {student}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                Submitted on {formatDateTime(application.createdAt)}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Approval Status */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                            Approval Progress
                        </h3>

                        {/* CC Approval */}
                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                            <div className="mt-0.5">{getStatusIcon(application.ccStatus)}</div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">Class Coordinator (CC)</p>
                                    <Badge
                                        variant={
                                            application.ccStatus === "approved"
                                                ? "default"
                                                : application.ccStatus === "rejected"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {application.ccStatus}
                                    </Badge>
                                </div>
                                {application.ccDate && (
                                    <p className="text-xs text-muted-foreground">
                                        {formatDateTime(application.ccDate)}
                                    </p>
                                )}
                                {application.ccRemarks && (
                                    <div className="mt-2 p-2 bg-background rounded border">
                                        <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                                        <p className="text-sm">{application.ccRemarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* HOD Approval */}
                        {requiresHOD && (
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                <div className="mt-0.5">{getStatusIcon(application.hodStatus)}</div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">Head of Department (HOD)</p>
                                        <Badge
                                            variant={
                                                application.hodStatus === "approved"
                                                    ? "default"
                                                    : application.hodStatus === "rejected"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {application.hodStatus}
                                        </Badge>
                                    </div>
                                    {application.hodDate && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(application.hodDate)}
                                        </p>
                                    )}
                                    {application.hodRemarks && (
                                        <div className="mt-2 p-2 bg-background rounded border">
                                            <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                                            <p className="text-sm">{application.hodRemarks}</p>
                                        </div>
                                    )}
                                    {!requiresHOD && (
                                        <p className="text-xs text-muted-foreground italic">
                                            Not required for {application.numberOfDays}-day leave
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VP Approval */}
                        {requiresVP && (
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                <div className="mt-0.5">{getStatusIcon(application.vpStatus)}</div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">Vice Principal (VP)</p>
                                        <Badge
                                            variant={
                                                application.vpStatus === "approved"
                                                    ? "default"
                                                    : application.vpStatus === "rejected"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {application.vpStatus}
                                        </Badge>
                                    </div>
                                    {application.vpDate && (
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(application.vpDate)}
                                        </p>
                                    )}
                                    {application.vpRemarks && (
                                        <div className="mt-2 p-2 bg-background rounded border">
                                            <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                                            <p className="text-sm">{application.vpRemarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rejection Summary */}
                    {application.overallStatus === "rejected" && (
                        <>
                            <Separator />
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                <div className="flex items-start gap-2">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                            Application Rejected
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            {application.ccStatus === "rejected" && (
                                                <div>
                                                    <p className="font-medium text-red-800 dark:text-red-200">
                                                        Rejected by: Class Coordinator (CC)
                                                    </p>
                                                    {application.ccRemarks && (
                                                        <p className="text-red-700 dark:text-red-300 mt-1">
                                                            Reason: {application.ccRemarks}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {application.hodStatus === "rejected" && (
                                                <div>
                                                    <p className="font-medium text-red-800 dark:text-red-200">
                                                        Rejected by: Head of Department (HOD)
                                                    </p>
                                                    {application.hodRemarks && (
                                                        <p className="text-red-700 dark:text-red-300 mt-1">
                                                            Reason: {application.hodRemarks}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {application.vpStatus === "rejected" && (
                                                <div>
                                                    <p className="font-medium text-red-800 dark:text-red-200">
                                                        Rejected by: Vice Principal (VP)
                                                    </p>
                                                    {application.vpRemarks && (
                                                        <p className="text-red-700 dark:text-red-300 mt-1">
                                                            Reason: {application.vpRemarks}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
