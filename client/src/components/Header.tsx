import { GraduationCap, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  userName: string;
  userRole: "student" | "faculty";
  facultyType?: "CC" | "HOD" | "VP";
  rollNo?: string;
  department?: string;
  division?: string;
  onLogout?: () => void;
}

export function Header({ userName, userRole, facultyType, rollNo, department, division, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">DL Management</h1>
            <p className="text-xs text-muted-foreground">Institute Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">{userName}</p>
                  <div className="flex items-center gap-1">
                    {userRole === "student" && rollNo && (
                      <p className="text-xs text-muted-foreground">{rollNo}</p>
                    )}
                    {userRole === "student" && department && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{department}</p>
                      </>
                    )}
                    {userRole === "student" && division && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">Div {division}</p>
                      </>
                    )}
                    {userRole === "faculty" && (
                      <>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                        {facultyType && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {facultyType}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
