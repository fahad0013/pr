import { Home, BookOpen, Radio, Trophy, User, Moon, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: Home, label: "হোম" },
  { to: "/subjects", icon: BookOpen, label: "বিষয়" },
  { to: "/live-exam", icon: Radio, label: "লাইভ পরীক্ষা" },
  { to: "/leaderboard", icon: Trophy, label: "লিডারবোর্ড" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
];

export function TopNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="hidden md:flex sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">প্রস্তুতি</span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
