import { BookOpen, Radio, Trophy, User, Moon, Sun, Flame, LogIn, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/subjects", icon: BookOpen, label: "বিষয়" },
  { to: "/live-exam", icon: Radio, label: "লাইভ পরীক্ষা" },
  { to: "/leaderboard", icon: Trophy, label: "লিডারবোর্ড" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
];

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileAvatar(null);
      setProfileName(null);
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfileAvatar(data.avatar_url || user.user_metadata?.avatar_url || null);
        setProfileName(data.display_name || user.user_metadata?.full_name || null);
      }
    };
    fetchProfile();

    // Listen for profile changes
    const channel = supabase
      .channel("profile-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, (payload) => {
        const p = payload.new as any;
        setProfileAvatar(p.avatar_url || null);
        setProfileName(p.display_name || null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const initial = (profileName || user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase();

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
                end={item.to === "/profile"}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={profileAvatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    আমার প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
