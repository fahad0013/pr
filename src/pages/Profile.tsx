import { Moon, Sun, ChevronRight, LogOut, Settings, HelpCircle, Bell, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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

const radarData = [
  { subject: "বাংলা", score: 78, fullMark: 100 },
  { subject: "ইংরেজি", score: 65, fullMark: 100 },
  { subject: "গণিত", score: 52, fullMark: 100 },
  { subject: "সা. জ্ঞান", score: 81, fullMark: 100 },
];

const menuItems = [
  { icon: Bell, label: "নোটিফিকেশন", chevron: true },
  { icon: Shield, label: "গোপনীয়তা", chevron: true },
  { icon: Settings, label: "সেটিংস", chevron: true },
  { icon: HelpCircle, label: "সাহায্য ও সমর্থন", chevron: true },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || "ব্যবহারকারী";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;

  const handleLogout = async () => {
    await signOut();
    navigate("/landing");
  };

  return (
    <motion.div
      className="container max-w-2xl py-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Profile Header */}
      <motion.div variants={item} className="flex flex-col items-center text-center">
        <Avatar className="mb-3 h-20 w-20 border-4 border-primary/20">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">{displayName}</h1>
        {email && <p className="text-sm text-muted-foreground">{email}</p>}
        <StreakBadge count={12} className="mt-3" />
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3 text-center">
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
      </motion.div>

      {/* Radar Analytics */}
      <motion.section variants={item}>
        <h2 className="mb-3 text-base font-semibold">বিষয়ভিত্তিক দক্ষতা</h2>
        <Card className="card-shadow">
          <CardContent className="p-4">
            <RadarChart data={radarData} />
          </CardContent>
        </Card>
      </motion.section>

      {/* Achievements */}
      <motion.section variants={item}>
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
      </motion.section>

      {/* Dark Mode Toggle */}
      <motion.div variants={item}>
        <Card className="card-shadow md:hidden">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="text-sm font-medium">ডার্ক মোড</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu */}
      <motion.div variants={item} className="space-y-1">
        {menuItems.map((mi) => (
          <Card key={mi.label} className="cursor-pointer hover-scale card-shadow">
            <CardContent className="flex items-center gap-3 p-4">
              <mi.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{mi.label}</span>
              {mi.chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Logout */}
      {user && (
        <motion.div variants={item}>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive min-h-[48px]"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            লগ আউট
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
