import { useState } from "react";
import { ClipboardCheck, BarChart3, Medal, ArrowRight, Radio, BookX } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { SubjectCard } from "@/components/SubjectCard";
import { RadarChart } from "@/components/RadarChart";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";

const stats = [
  { icon: ClipboardCheck, label: "পরীক্ষা দিয়েছেন", value: 47 },
  { icon: BarChart3, label: "গড় স্কোর", value: "৭২%" },
  { icon: Medal, label: "র‍্যাংক", value: "#১২৩" },
];

const continueSubjects = [
  { name: "বাংলা ভাষা ও সাহিত্য", icon: "📚", topicCount: 45, completionPercent: 68 },
  { name: "English Language", icon: "🔤", topicCount: 38, completionPercent: 42 },
  { name: "গণিত", icon: "🔢", topicCount: 52, completionPercent: 35 },
];

const radarData = [
  { subject: "বাংলা", score: 78, fullMark: 100 },
  { subject: "ইংরেজি", score: 65, fullMark: 100 },
  { subject: "গণিত", score: 52, fullMark: 100 },
  { subject: "সা. জ্ঞান", score: 81, fullMark: 100 },
];

const mistakesSummary = [
  { subject: "বাংলা", count: 12 },
  { subject: "ইংরেজি", count: 18 },
  { subject: "গণিত", count: 24 },
  { subject: "সা. জ্ঞান", count: 8 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Index() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const handleProtectedAction = () => {
    if (!user) {
      setLoginPrompt(true);
    }
  };

  return (
    <motion.div
      className="container max-w-2xl py-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
        message="আপনার প্রগতি দেখতে ও পরীক্ষা দিতে লগইন করুন।"
      />

      {/* Hero */}
      <motion.section variants={item} className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
        <StreakBadge count={12} className="mb-4" />
        <h1 className="mb-2 text-2xl font-bold leading-tight md:text-3xl">
          আজকে কি প্রস্তুত? 💪
        </h1>
        <p className="mb-5 text-sm opacity-80">
          প্রতিদিন একটু একটু করে এগিয়ে যান — সাফল্য আসবেই!
        </p>
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[48px] text-base"
          onClick={user ? undefined : handleProtectedAction}
        >
          অনুশীলন শুরু করুন
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.section>

      {/* Daily Progress */}
      <motion.section variants={item} className="flex items-center gap-5">
        <ProgressRing progress={65} size={90} strokeWidth={7}>
          <div className="text-center">
            <span className="text-lg font-bold">৬৫%</span>
          </div>
        </ProgressRing>
        <div>
          <h2 className="font-semibold">আজকের লক্ষ্য</h2>
          <p className="text-sm text-muted-foreground">১৩/২০ প্রশ্নের উত্তর দিয়েছেন</p>
          <p className="mt-1 text-xs text-primary font-medium">আরও ৭টি বাকি — চালিয়ে যান!</p>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section variants={item} className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.section>

      {/* Subject Analytics - Radar Chart */}
      <motion.section variants={item}>
        <h2 className="mb-3 text-lg font-semibold">বিষয়ভিত্তিক বিশ্লেষণ 📊</h2>
        <Card className="card-shadow">
          <CardContent className="p-4">
            <RadarChart data={radarData} />
          </CardContent>
        </Card>
      </motion.section>

      {/* Mistake Tracker */}
      <motion.section variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookX className="h-5 w-5 text-destructive" />
            ভুল উত্তরের খাতা
          </h2>
        </div>
        <Card className="card-shadow">
          <CardContent className="p-4 space-y-3">
            {mistakesSummary.map((m) => (
              <div key={m.subject} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{m.subject}</span>
                <span className="text-sm text-destructive font-semibold">{m.count}টি ভুল</span>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full mt-2 min-h-[44px] border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={user ? undefined : handleProtectedAction}
            >
              রিভিশন পরীক্ষা দিন
            </Button>
          </CardContent>
        </Card>
      </motion.section>

      {/* Live Exam Banner */}
      <motion.div variants={item}>
        <Link to="/live-exam">
          <Card className="border-accent/50 bg-accent/5 card-shadow hover-scale cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Radio className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-accent">লাইভ পরীক্ষা চলছে</p>
                <p className="font-semibold">BCS প্রিলি মক টেস্ট — ০৭</p>
                <p className="text-xs text-muted-foreground">২৩৪ জন অংশগ্রহণ করছে</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Continue Studying */}
      <motion.section variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">চালিয়ে যান</h2>
          <Link to="/subjects" className="text-sm font-medium text-primary hover:underline">
            সব দেখুন
          </Link>
        </div>
        <div className="space-y-3">
          {continueSubjects.map((sub) => (
            <SubjectCard key={sub.name} {...sub} />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
