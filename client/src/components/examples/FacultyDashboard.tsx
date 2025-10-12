import { ThemeProvider } from "../ThemeProvider";
import { FacultyDashboard as FacultyDashboardComponent } from "../FacultyDashboard";

export default function FacultyDashboardExample() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-8">
        <FacultyDashboardComponent facultyType="CC" />
      </div>
    </ThemeProvider>
  );
}
