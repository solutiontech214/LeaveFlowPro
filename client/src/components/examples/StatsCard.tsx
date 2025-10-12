import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { StatsCard as StatsCardComponent } from "../StatsCard";

export default function StatsCardExample() {
  return (
    <div className="grid gap-4 p-8 md:grid-cols-2 lg:grid-cols-4">
      <StatsCardComponent title="Total Applications" value={12} icon={FileText} />
      <StatsCardComponent title="Pending" value={3} icon={Clock} />
      <StatsCardComponent title="Approved" value={8} icon={CheckCircle} />
      <StatsCardComponent title="Rejected" value={1} icon={XCircle} />
    </div>
  );
}
