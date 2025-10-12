import { StatusBadge as StatusBadgeComponent } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4 p-8">
      <StatusBadgeComponent status="pending" />
      <StatusBadgeComponent status="approved" />
      <StatusBadgeComponent status="rejected" />
    </div>
  );
}
