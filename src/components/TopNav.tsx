import { Home, BookOpen, Radio, Trophy, User, Moon, Sun, Flame, LogIn } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

const navItems = [
  { to: "/", icon: Home, label: "হোম" },
  { to: "/subjects", icon: BookOpen, label: "বিষয়" },
  { to: "/live-exam", icon: Radio, label: "লাইভ পরীক্ষা" },
  { to: "/leaderboard", icon: Trophy, label: "লিডারবোর্ড" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
];

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <header className="hidden md:flex sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">প্রস্তুতি</span>
            {user && (
              <div className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                <Flame className="h-4 w-4" />
                <span>🔥</span>
              </div>
            )}
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

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            {user ? (
              <button onClick={() => navigate("/profile")} className="rounded-full">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                <LogIn className="mr-1.5 h-4 w-4" />
                লগইন
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
