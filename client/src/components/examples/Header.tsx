import { ThemeProvider } from "../ThemeProvider";
import { Header as HeaderComponent } from "../Header";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <HeaderComponent
        userName="Rahul Sharma"
        userRole="student"
        onLogout={() => console.log("Logout clicked")}
      />
    </ThemeProvider>
  );
}
