import { Moon, Sun, ChevronRight, LogOut, Settings, HelpCircle, Bell, Shield, Camera, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useBadges } from "@/hooks/useBadges";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { BadgeCelebration } from "@/components/BadgeCelebration";

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
  const [profileData, setProfileData] = useState<any>(null);

  const email = user?.email;
  const { badges, newBadge, dismissCelebration, checkAndAward } = useBadges();

  useEffect(() => {
    checkAndAward();
  }, [checkAndAward]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url, district, institution, role, daily_goal_minutes")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || user.user_metadata?.full_name || "ব্যবহারকারী");
          setAvatarUrl(data.avatar_url || user.user_metadata?.avatar_url || null);
          setProfileData(data);
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
      await supabase.storage.from("avatars").remove([filePath]);
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newUrl = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user.id);
      setAvatarUrl(newUrl);
      toast.success("প্রোফাইল ছবি আপডেট হয়েছে!");
    } catch (err: any) {
      toast.error("ছবি আপলোড ব্যর্থ হয়েছে");
    } finally {
      setUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() }).eq("id", user.id);
    if (error) toast.error("নাম আপডেট ব্যর্থ হয়েছে");
    else toast.success("নাম আপডেট হয়েছে!");
    setEditingName(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <motion.div
      className="container max-w-2xl py-5 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ─── Profile Header ─── */}
      <motion.div variants={item} className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <Avatar className="h-20 w-20 border-4 border-primary/20">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-9 w-48 text-center" autoFocus onKeyDown={(e) => e.key === "Enter" && handleNameSave()} />
            <Button size="sm" onClick={handleNameSave}>সেভ</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{displayName}</h1>
            <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {email && <p className="text-sm text-muted-foreground">{email}</p>}
        {profileData?.district && (
          <p className="text-xs text-muted-foreground mt-1">
            {profileData.district} {profileData.institution ? `· ${profileData.institution}` : ""}
          </p>
        )}
      </motion.div>

      {/* ─── Badges ─── */}
      <motion.div variants={item}>
        <h2 className="text-base font-semibold mb-3 text-center">অর্জিত ব্যাজ</h2>
        <BadgeDisplay badges={badges} />
      </motion.div>

      {/* ─── Badge Celebration ─── */}
      <BadgeCelebration badge={newBadge} onDismiss={dismissCelebration} />

      {/* ─── Profile Info Cards ─── */}
      <motion.div variants={item}>
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ভূমিকা</span>
              <span className="font-medium">{profileData?.role || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">জেলা</span>
              <span className="font-medium">{profileData?.district || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">প্রতিষ্ঠান</span>
              <span className="font-medium">{profileData?.institution || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">দৈনিক লক্ষ্য</span>
              <span className="font-medium">{profileData?.daily_goal_minutes || 60} মিনিট</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Dark Mode Toggle ─── */}
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

      {/* ─── Menu ─── */}
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

      {/* ─── Logout ─── */}
      <motion.div variants={item}>
        <Button variant="outline" className="w-full text-destructive hover:text-destructive min-h-[48px]" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />লগ আউট
        </Button>
      </motion.div>
    </motion.div>
  );
}
