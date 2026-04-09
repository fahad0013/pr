import { Home, BookOpen, Radio, Trophy, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "হোম" },
  { to: "/subjects", icon: BookOpen, label: "বিষয়" },
  { to: "/live-exam", icon: Radio, label: "লাইভ পরীক্ষা" },
  { to: "/leaderboard", icon: Trophy, label: "লিডারবোর্ড" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors min-w-[56px]",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full p-1 transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="leading-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
