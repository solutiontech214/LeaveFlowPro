import { ThemeProvider } from "../ThemeProvider";
import { LoginPage as LoginPageComponent } from "../LoginPage";

export default function LoginPageExample() {
  return (
    <ThemeProvider>
      <LoginPageComponent
        onLogin={(email, password, role) => {
          console.log("Login:", { email, password, role });
        }}
      />
    </ThemeProvider>
  );
}
