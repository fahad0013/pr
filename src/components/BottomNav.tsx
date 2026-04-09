import { BookOpen, Radio, Trophy, User, Flame } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { to: "/subjects", icon: BookOpen, label: "বিষয়" },
  { to: "/live-exam", icon: Radio, label: "লাইভ" },
  { to: "/leaderboard", icon: Trophy, label: "লিডারবোর্ড" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
];

export function BottomNav() {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md md:hidden">
      {/* Streak fire in center top */}
      {user && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
          <Flame className="h-3 w-3" />
          🔥
        </div>
      )}
      <div className="flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/profile"}
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
                  {item.to === "/profile" && user ? (
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
