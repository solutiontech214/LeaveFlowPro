import { ApplicationCard as ApplicationCardComponent } from "../ApplicationCard";

export default function ApplicationCardExample() {
  const application = {
    id: "1",
    studentName: "Priya Patel",
    rollNo: "EC21B015",
    department: "Electronics",
    numberOfDays: 2,
    reason: "Attending National Level Technical Symposium",
    dateFrom: "2024-01-25",
    dateTo: "2024-01-26",
    status: "pending" as const,
    submittedDate: "2024-01-20",
    additionalStudents: ["Amit Kumar", "Sneha Reddy"],
  };

  return (
    <div className="p-8">
      <ApplicationCardComponent
        application={application}
        showActions
        onApprove={(id) => console.log("Approve:", id)}
        onReject={(id) => console.log("Reject:", id)}
      />
    </div>
  );
}
