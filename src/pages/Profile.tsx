import { Moon, Sun, ChevronRight, LogOut, Settings, HelpCircle, Bell, Shield, Camera, Pencil, ArrowRight, Radio, Zap, Target, Trophy, Medal, Play, RotateCcw, TrendingUp, BookX, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

/* ── Dashboard mock data ── */
const userData = {
  streak: 12, xp: 2450, level: 7, xpForNext: 3000,
  dailyGoal: 60, dailyDone: 38, accuracy: 74, totalTests: 47, avgScore: 72, rank: 123,
};

const lastTest = { name: "প্রাথমিক শিক্ষক মক টেস্ট — ০১", progress: 60, questionsLeft: 16 };

const newTests = [
  { id: "primary-mock-01", name: "প্রাথমিক শিক্ষক মক টেস্ট — ০১", subject: "🏫", questions: 80 },
];

const leaderboard = [
  { rank: 1, name: "রাহুল আহমেদ", score: 9850, avatar: "🥇" },
  { rank: 2, name: "ফাতেমা খানম", score: 9720, avatar: "🥈" },
  { rank: 3, name: "সাকিব হাসান", score: 9680, avatar: "🥉" },
];

const mistakesSummary = [
  { subject: "বাংলা", count: 12, emoji: "📚" },
  { subject: "ইংরেজি", count: 18, emoji: "🔤" },
  { subject: "গণিত", count: 24, emoji: "🔢" },
  { subject: "সা. জ্ঞান", count: 8, emoji: "🌍" },
];

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

function getLevelTitle(level: number) {
  const titles = ["নবীন", "শিক্ষানবিশ", "অনুশীলনকারী", "নিয়মিত", "পরিশ্রমী", "দক্ষ", "মেধাবী", "বিশেষজ্ঞ", "মাস্টার", "কিংবদন্তি"];
  return titles[Math.min(level - 1, titles.length - 1)];
}

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
  const d = userData;
  const dailyPercent = Math.round((d.dailyDone / d.dailyGoal) * 100);
  const xpPercent = Math.round((d.xp / d.xpForNext) * 100);
  const name = user?.user_metadata?.full_name?.split(" ")[0] || displayName || "শিক্ষার্থী";

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
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
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleNameSave = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() }).eq("user_id", user.id);
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
        <StreakBadge count={d.streak} className="mt-3" />
      </motion.div>

      {/* ─── Welcome + Streak + Level ─── */}
      <motion.section
        variants={item}
        className="rounded-2xl bg-gradient-to-br from-secondary via-secondary to-secondary/80 p-5 text-secondary-foreground relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-accent/10 blur-xl" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-70">শুভ সন্ধ্যা 👋</p>
              <h2 className="text-2xl font-bold leading-tight">{name}, আজ কতটুকু করবে?</h2>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 border-2 border-accent/40">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-accent">Lv.{d.level}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold">
              <span>🔥</span><span>{d.streak} দিন</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
              <Zap className="h-4 w-4 text-accent" /><span>{d.xp.toLocaleString()} XP</span>
            </div>
            <span className="text-xs rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">{getLevelTitle(d.level)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-70">
              <span>পরবর্তী লেভেল</span><span>{d.xp}/{d.xpForNext} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2 bg-primary/10" />
          </div>
        </div>
      </motion.section>

      {/* ─── Daily Goal ─── */}
      <motion.section variants={item}>
        <Card className="card-shadow border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <ProgressRing progress={dailyPercent} size={72} strokeWidth={6}>
                <div className="text-center"><span className="text-base font-bold">{dailyPercent}%</span></div>
              </ProgressRing>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold flex items-center gap-1.5"><Target className="h-4 w-4 text-primary" />আজকের লক্ষ্য</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{d.dailyDone} / {d.dailyGoal} মিনিট সম্পন্ন</p>
                <p className="text-xs text-primary font-medium mt-1">
                  {d.dailyGoal - d.dailyDone > 0 ? `আরও ${d.dailyGoal - d.dailyDone} মিনিট — চালিয়ে যাও! 💪` : "🎉 আজকের লক্ষ্য পূরণ!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── Continue Last Test ─── */}
      <motion.section variants={item}>
        <Card className="card-shadow border-accent/30 bg-accent/5 hover-scale cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                <RotateCcw className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-accent uppercase tracking-wide">অসম্পূর্ণ পরীক্ষা</p>
                <p className="font-semibold text-foreground truncate">{lastTest.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Progress value={lastTest.progress} className="h-1.5 flex-1 bg-accent/10" />
                  <span className="text-xs text-muted-foreground shrink-0">{lastTest.questionsLeft}টি বাকি</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-accent shrink-0" />
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── Start New Test ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-1.5"><Play className="h-4 w-4 text-primary" />নতুন পরীক্ষা শুরু করুন</h2>
          <Link to="/live-exam" className="text-xs font-medium text-primary hover:underline">সব দেখুন</Link>
        </div>
        <div className="space-y-2.5">
          {newTests.map((test) => (
            <Card key={test.id} className="card-shadow hover-scale cursor-pointer">
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="text-2xl">{test.subject}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.questions} প্রশ্ন</p>
                </div>
                <Button size="sm" className="shrink-0 gap-1 min-h-[36px]" onClick={() => navigate(`/exam/${test.id}`)}>
                  শুরু<ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* ─── Quick Stats ─── */}
      <motion.section variants={item}>
        <h2 className="text-base font-semibold mb-3">আপনার পরিসংখ্যান</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">{d.accuracy}%</p>
              <p className="text-xs text-muted-foreground">সঠিকতা</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">{d.totalTests}</p>
              <p className="text-xs text-muted-foreground">মোট পরীক্ষা</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Medal className="h-5 w-5 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">#{d.rank}</p>
              <p className="text-xs text-muted-foreground">সার্বিক র‍্যাংক</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">{d.xp.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">মোট XP</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* ─── Subject Analytics ─── */}
      <motion.section variants={item}>
        <h2 className="text-base font-semibold mb-3">বিষয়ভিত্তিক দক্ষতা 📊</h2>
        <Card className="card-shadow">
          <CardContent className="p-4"><RadarChart data={radarData} /></CardContent>
        </Card>
      </motion.section>

      {/* ─── Mistake Tracker ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2"><BookX className="h-4 w-4 text-destructive" />ভুল উত্তরের খাতা</h2>
          <Link to="/error-bank" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">সব দেখুন <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-2.5">
            {mistakesSummary.map((m) => (
              <div key={m.subject} className="flex items-center gap-3">
                <span className="text-lg">{m.emoji}</span>
                <span className="text-sm font-medium text-foreground flex-1">{m.subject}</span>
                <div className="w-24"><Progress value={(m.count / 30) * 100} className="h-1.5" /></div>
                <span className="text-xs text-destructive font-semibold w-12 text-right">{m.count}টি</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1 min-h-[42px] border-destructive/30 text-destructive hover:bg-destructive/10 text-sm" onClick={() => navigate("/exam/revision?mode=revision")}>
                <RotateCcw className="mr-1.5 h-4 w-4" />রিভিশন পরীক্ষা
              </Button>
              <Button variant="outline" className="flex-1 min-h-[42px] text-sm" onClick={() => navigate("/error-bank")}>
                <BookX className="mr-1.5 h-4 w-4" />সব ভুল দেখুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── Live Exam Banner ─── */}
      <motion.div variants={item}>
        <Link to="/live-exam">
          <Card className="border-accent/40 bg-gradient-to-r from-accent/10 to-accent/5 card-shadow hover-scale cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20 animate-pulse">
                <Radio className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-accent uppercase tracking-wide">🔴 লাইভ চলছে</p>
                <p className="font-semibold text-foreground">প্রাথমিক শিক্ষক মক টেস্ট — ০১</p>
                <p className="text-xs text-muted-foreground">২৩৪ জন অংশগ্রহণ করছে</p>
              </div>
              <ArrowRight className="h-5 w-5 text-accent" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* ─── Leaderboard Preview ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-1.5"><Trophy className="h-4 w-4 text-accent" />এই সপ্তাহের সেরা</h2>
          <Link to="/leaderboard" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">সব দেখুন <ChevronRight className="h-3.5 w-3.5" /></Link>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-0 divide-y divide-border/50">
            {leaderboard.map((u) => (
              <div key={u.rank} className={cn("flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40", u.rank === 1 && "bg-accent/5")}>
                <span className="text-xl w-7 text-center">{u.avatar}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{u.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground truncate">{u.name}</p></div>
                <span className="text-sm font-bold text-primary">{u.score.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary/5">
              <span className="text-sm font-bold w-7 text-center text-primary">#{d.rank}</span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">আপনি</p></div>
              <span className="text-sm font-bold text-primary">{(7250).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── Achievements ─── */}
      <motion.section variants={item}>
        <h2 className="mb-3 text-base font-semibold">অ্যাচিভমেন্ট</h2>
        <div className="grid grid-cols-4 gap-3">
          {achievements.map((a) => (
            <div key={a.label} className={cn("flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-opacity", a.unlocked ? "card-shadow bg-card" : "opacity-40")}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{a.label}</span>
            </div>
          ))}
        </div>
      </motion.section>

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

      {/* ─── Motivational Footer ─── */}
      <motion.section variants={item} className="text-center pt-2 pb-4">
        <p className="text-sm text-muted-foreground italic">"প্রতিদিন একটু একটু করে এগিয়ে যাও — সাফল্য আসবেই!" ✨</p>
      </motion.section>
    </motion.div>
  );
}
