import { Moon, Sun, ChevronRight, LogOut, Settings, HelpCircle, Bell, Shield, Camera, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const email = user?.email;

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || user.user_metadata?.full_name || "ব্যবহারকারী");
          setAvatarUrl(data.avatar_url || user.user_metadata?.avatar_url || null);
        } else {
          setDisplayName(user.user_metadata?.full_name || "ব্যবহারকারী");
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      // Remove old avatar if exists
      await supabase.storage.from("avatars").remove([filePath]);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting param
      const newUrl = `${publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("user_id", user.id);

      setAvatarUrl(newUrl);
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে!");
    } catch (err: any) {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast.error("নাম আপডেট ব্যর্থ হয়েছে");
    } else {
      toast.success("নাম আপডেট হয়েছে!");
    }
    setEditingName(false);
  };

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
        <div className="relative mb-3">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {user && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 w-48 text-center"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
            />
            <Button size="sm" onClick={handleNameSave}>সেভ</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{displayName}</h1>
            {user && (
              <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
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
