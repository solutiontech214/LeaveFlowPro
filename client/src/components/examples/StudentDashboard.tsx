import { ThemeProvider } from "../ThemeProvider";
import { StudentDashboard as StudentDashboardComponent } from "../StudentDashboard";

export default function StudentDashboardExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <StudentDashboardComponent onApplyClick={() => console.log("Apply for leave clicked")} />
      </div>
    </ThemeProvider>
  );
}
