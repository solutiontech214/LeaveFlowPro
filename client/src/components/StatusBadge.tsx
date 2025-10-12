import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-warning/10 text-warning border-warning/20",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-success/10 text-success border-success/20",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={className} data-testid={`badge-status-${status}`}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}
