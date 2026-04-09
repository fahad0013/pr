import { BookOpen, Radio, Trophy, User, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "হোম", end: true },
  { to: "/dashboard/subjects", icon: BookOpen, label: "বিষয়", end: false },
  { to: "/dashboard/live-exam", icon: Radio, label: "লাইভ", end: false },
  { to: "/dashboard/leaderboard", icon: Trophy, label: "লিডারবোর্ড", end: false },
  { to: "/dashboard/profile", icon: User, label: "প্রোফাইল", end: false },
];

export function DashboardBottomNav() {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs transition-colors min-w-[48px]",
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
                  {item.to === "/dashboard/profile" && user ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-semibold">
                        {(user.user_metadata?.full_name || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <item.icon className="h-5 w-5" />
                  )}
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
