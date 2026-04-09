import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Radio,
  Zap,
  Target,
  Trophy,
  Medal,
  ChevronRight,
  Play,
  RotateCcw,
  TrendingUp,
  BookX,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { cn } from "@/lib/utils";

/* ── Mock data (replace with Supabase queries later) ── */
const userData = {
  displayName: "রাফিদ",
  streak: 12,
  xp: 2450,
  level: 7,
  xpForNext: 3000,
  dailyGoal: 60,
  dailyDone: 38,
  accuracy: 74,
  totalTests: 47,
  avgScore: 72,
  rank: 123,
};

const lastTest = {
  name: "প্রাথমিক শিক্ষক মক টেস্ট — ০১",
  progress: 60,
  questionsLeft: 16,
};

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

const radarData = [
  { subject: "বাংলা", score: 78, fullMark: 100 },
  { subject: "ইংরেজি", score: 65, fullMark: 100 },
  { subject: "গণিত", score: 52, fullMark: 100 },
  { subject: "সা. জ্ঞান", score: 81, fullMark: 100 },
];

/* ── Animations ── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ── Helpers ── */
function getLevelTitle(level: number) {
  const titles = ["নবীন", "শিক্ষানবিশ", "অনুশীলনকারী", "নিয়মিত", "পরিশ্রমী", "দক্ষ", "মেধাবী", "বিশেষজ্ঞ", "মাস্টার", "কিংবদন্তি"];
  return titles[Math.min(level - 1, titles.length - 1)];
}

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const d = userData;
  const dailyPercent = Math.round((d.dailyDone / d.dailyGoal) * 100);
  const xpPercent = Math.round((d.xp / d.xpForNext) * 100);
  const name = user?.user_metadata?.full_name?.split(" ")[0] || d.displayName;

  const requireAuth = () => {
    if (!user) setLoginPrompt(true);
  };

  return (
    <motion.div
      className="container max-w-2xl py-5 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
      />

      {/* ─── 1. Welcome + Streak + Level ─── */}
      <motion.section
        variants={item}
        className="rounded-2xl bg-gradient-to-br from-secondary via-secondary to-secondary/80 p-5 text-secondary-foreground relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-accent/10 blur-xl" />

        <div className="relative">
          {/* Top row: greeting + level badge */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm opacity-70">শুভ সন্ধ্যা 👋</p>
              <h1 className="text-2xl font-bold leading-tight">
                {name}, আজ কতটুকু করবে?
              </h1>
            </div>
            {/* Level badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 border-2 border-accent/40">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-accent">Lv.{d.level}</span>
            </div>
          </div>

          {/* Streak + XP row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-sm font-bold">
              <span>🔥</span>
              <span>{d.streak} দিন</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
              <Zap className="h-4 w-4 text-accent" />
              <span>{d.xp.toLocaleString()} XP</span>
            </div>
            <span className="text-xs rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
              {getLevelTitle(d.level)}
            </span>
          </div>

          {/* XP progress to next level */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-70">
              <span>পরবর্তী লেভেল</span>
              <span>{d.xp}/{d.xpForNext} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2 bg-primary/10" />
          </div>
        </div>
      </motion.section>

      {/* ─── 2. Daily Goal ─── */}
      <motion.section variants={item}>
        <Card className="card-shadow border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <ProgressRing progress={dailyPercent} size={72} strokeWidth={6}>
                <div className="text-center">
                  <span className="text-base font-bold">{dailyPercent}%</span>
                </div>
              </ProgressRing>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  আজকের লক্ষ্য
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {d.dailyDone} / {d.dailyGoal} মিনিট সম্পন্ন
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  {d.dailyGoal - d.dailyDone > 0
                    ? `আরও ${d.dailyGoal - d.dailyDone} মিনিট — চালিয়ে যাও! 💪`
                    : "🎉 আজকের লক্ষ্য পূরণ!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── 3. Continue Last Test ─── */}
      <motion.section variants={item}>
        <Card className="card-shadow border-accent/30 bg-accent/5 hover-scale cursor-pointer" onClick={requireAuth}>
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

      {/* ─── 4. Start New Test ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-1.5">
            <Play className="h-4 w-4 text-primary" />
            নতুন পরীক্ষা শুরু করুন
          </h2>
          <Link to="/live-exam" className="text-xs font-medium text-primary hover:underline">সব দেখুন</Link>
        </div>
        <div className="space-y-2.5">
          {newTests.map((test) => (
            <Card key={test.id} className="card-shadow hover-scale cursor-pointer" onClick={requireAuth}>
              <CardContent className="flex items-center gap-3 p-3.5">
                <span className="text-2xl">{test.subject}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.questions} প্রশ্ন</p>
                </div>
                <Button size="sm" className="shrink-0 gap-1 min-h-[36px]" onClick={(e) => { e.stopPropagation(); if (user) navigate(`/exam/${test.id}`); else requireAuth(); }}>
                  শুরু
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* ─── 5. Quick Stats ─── */}
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

      {/* ─── 6. Subject Analytics ─── */}
      <motion.section variants={item}>
        <h2 className="text-base font-semibold mb-3">বিষয়ভিত্তিক দক্ষতা 📊</h2>
        <Card className="card-shadow">
          <CardContent className="p-4">
            <RadarChart data={radarData} />
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── 7. Mistake Tracker / Error Bank ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BookX className="h-4 w-4 text-destructive" />
            ভুল উত্তরের খাতা
          </h2>
          <Link to="/error-bank" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
            সব দেখুন <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-2.5">
            {mistakesSummary.map((m) => (
              <div key={m.subject} className="flex items-center gap-3">
                <span className="text-lg">{m.emoji}</span>
                <span className="text-sm font-medium text-foreground flex-1">{m.subject}</span>
                <div className="w-24">
                  <Progress
                    value={(m.count / 30) * 100}
                    className="h-1.5"
                  />
                </div>
                <span className="text-xs text-destructive font-semibold w-12 text-right">{m.count}টি</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1 min-h-[42px] border-destructive/30 text-destructive hover:bg-destructive/10 text-sm"
                onClick={() => user ? navigate("/exam/revision?mode=revision") : requireAuth()}
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                রিভিশন পরীক্ষা
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-h-[42px] text-sm"
                onClick={() => navigate("/error-bank")}
              >
                <BookX className="mr-1.5 h-4 w-4" />
                সব ভুল দেখুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── 8. Live Exam Banner ─── */}
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

      {/* ─── 9. Leaderboard Preview ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-accent" />
            এই সপ্তাহের সেরা
          </h2>
          <Link to="/leaderboard" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
            সব দেখুন <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-0 divide-y divide-border/50">
            {leaderboard.map((u) => (
              <div
                key={u.rank}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                  u.rank === 1 && "bg-accent/5"
                )}
              >
                <span className="text-xl w-7 text-center">{u.avatar}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                </div>
                <span className="text-sm font-bold text-primary">{u.score.toLocaleString()}</span>
              </div>
            ))}
            {/* Your position */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5">
                <span className="text-sm font-bold w-7 text-center text-primary">#{d.rank}</span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">আপনি</p>
                </div>
                <span className="text-sm font-bold text-primary">{(7250).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── 10. Motivational Footer ─── */}
      <motion.section variants={item} className="text-center pt-2 pb-4">
        <p className="text-sm text-muted-foreground italic">
          "প্রতিদিন একটু একটু করে এগিয়ে যাও — সাফল্য আসবেই!" ✨
        </p>
      </motion.section>
    </motion.div>
  );
}
