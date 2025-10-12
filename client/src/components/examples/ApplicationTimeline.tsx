import { ApplicationTimeline as ApplicationTimelineComponent } from "../ApplicationTimeline";

export default function ApplicationTimelineExample() {
  const steps = [
    { name: "Application Submitted", status: "completed" as const, date: "Jan 10, 2024" },
    { name: "CC Approval", status: "completed" as const, date: "Jan 11, 2024" },
    { name: "HOD Approval", status: "current" as const },
    { name: "Final Approval", status: "pending" as const },
  ];

  return (
    <div className="p-8">
      <ApplicationTimelineComponent steps={steps} />
    </div>
  );
}
