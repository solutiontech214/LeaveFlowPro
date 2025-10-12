import { DutyLeaveForm as DutyLeaveFormComponent } from "../DutyLeaveForm";

export default function DutyLeaveFormExample() {
  return (
    <div className="p-8">
      <DutyLeaveFormComponent
        studentName="Rahul Sharma"
        studentRollNo="CS21B001"
        department="Computer Science"
        division="A"
        attendancePercentage={82}
        onSubmit={(data) => console.log("Form submitted:", data)}
      />
    </div>
  );
}
