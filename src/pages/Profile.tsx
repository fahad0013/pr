import { Moon, Sun, ChevronRight, LogOut, Settings, HelpCircle, Bell, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const achievements = [
  { icon: "🔥", label: "৭ দিন স্ট্রিক", unlocked: true },
  { icon: "🏆", label: "প্রথম পরীক্ষা", unlocked: true },
  { icon: "💯", label: "১০০% স্কোর", unlocked: true },
  { icon: "📚", label: "৫০ টপিক শেষ", unlocked: true },
  { icon: "⚡", label: "স্পিড কিং", unlocked: false },
  { icon: "🎯", label: "নিখুঁত ১০", unlocked: false },
  { icon: "🌟", label: "শীর্ষ ১০", unlocked: false },
  { icon: "🎓", label: "সব বিষয় শেষ", unlocked: false },
];

const menuItems = [
  { icon: Bell, label: "নোটিফিকেশন", chevron: true },
  { icon: Shield, label: "গোপনীয়তা", chevron: true },
  { icon: Settings, label: "সেটিংস", chevron: true },
  { icon: HelpCircle, label: "সাহায্য ও সমর্থন", chevron: true },
];

export default function Profile() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="mb-3 h-20 w-20 border-4 border-primary/20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            আ
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">আরিফ হোসেন</h1>
        <p className="text-sm text-muted-foreground">BCS পরীক্ষার্থী — ৪৬তম ব্যাচ</p>
        <StreakBadge count={12} className="mt-3" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <ProgressRing progress={72} size={56} strokeWidth={5}>
              <span className="text-xs font-bold">৭২%</span>
            </ProgressRing>
            <p className="mt-2 text-xs text-muted-foreground">গড় স্কোর</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold text-primary">৪৭</span>
            <p className="mt-1 text-xs text-muted-foreground">পরীক্ষা দিয়েছেন</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <span className="text-2xl font-bold text-primary">৪</span>
            <p className="mt-1 text-xs text-muted-foreground">ব্যাজ অর্জিত</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 text-base font-semibold">অ্যাচিভমেন্ট</h2>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div
              key={a.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-opacity",
                a.unlocked ? "card-shadow bg-card" : "opacity-40"
              )}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Mode Toggle */}
      <Card className="card-shadow md:hidden">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="text-sm font-medium">ডার্ক মোড</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </CardContent>
      </Card>

      {/* Menu */}
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Card key={item.label} className="cursor-pointer hover-scale card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logout */}
      <Button variant="outline" className="w-full text-destructive hover:text-destructive min-h-[48px]">
        <LogOut className="mr-2 h-4 w-4" />
        লগ আউট
      </Button>
    </div>
  );
}
