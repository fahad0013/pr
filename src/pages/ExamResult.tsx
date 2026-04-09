import { useMemo, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateResultPDF } from "@/utils/generateResultPDF";
import {
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Trophy,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Home,
  Moon,
  Sun,
  ChevronDown,
  Lightbulb,
  Star,
  Target,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface QuestionResult {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  selected: number | null;
  subject: string;
}

interface ExamResultData {
  testName: string;
  questions: QuestionResult[];
  timeTaken: number;
  totalTime: number;
  testId?: number | null;
  isRevision?: boolean;
}

/* ── Helpers ── */
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}মি. ${s}সে.`;
}

function getPerformanceMessage(score: number) {
  if (score >= 90) return { text: "অসাধারণ! তুমি একজন তারকা! 🌟", emoji: "🏆", color: "text-primary" };
  if (score >= 75) return { text: "দারুণ করেছ! আরেকটু চেষ্টায় সেরা হবে! 💪", emoji: "🎯", color: "text-primary" };
  if (score >= 60) return { text: "ভালো চেষ্টা! নিয়মিত অনুশীলনে আরও ভালো হবে!", emoji: "📈", color: "text-accent-foreground" };
  if (score >= 40) return { text: "চালিয়ে যাও! প্র্যাকটিসে পারফেক্ট হবে!", emoji: "💡", color: "text-accent-foreground" };
  return { text: "হাল ছেড়ো না! প্রতিটি ভুল থেকে শেখো!", emoji: "🔥", color: "text-destructive" };
}

function getXpEarned(score: number, total: number) {
  const base = total * 5;
  const bonusAccuracy = score >= 80 ? 50 : score >= 60 ? 25 : 0;
  const bonusComplete = 20;
  return base + bonusAccuracy + bonusComplete;
}

const optionLabels = ["ক", "খ", "গ", "ঘ"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const data = location.state as ExamResultData | undefined;
  const [realRank, setRealRank] = useState<number | null>(null);

  // Redirect if no data
  useEffect(() => {
    if (!data) {
      navigate("/dashboard", { replace: true });
    }
  }, [data, navigate]);

  // Calculate real rank for this test
  useEffect(() => {
    if (!data?.testId || !user) return;
    const fetchRank = async () => {
      const { data: results } = await supabase
        .from("results")
        .select("user_id, total_score")
        .eq("test_id", data.testId as any);
      if (!results) return;
      const userBest: Record<string, number> = {};
      results.forEach((r: any) => {
        if (r.user_id) {
          userBest[r.user_id] = Math.max(userBest[r.user_id] || 0, Number(r.total_score || 0));
        }
      });
      const sorted = Object.entries(userBest).sort(([, a], [, b]) => b - a);
      const myIdx = sorted.findIndex(([id]) => id === user.id);
      if (myIdx >= 0) setRealRank(myIdx + 1);
    };
    fetchRank();
  }, [data?.testId, user]);

  const questions = data?.questions || [];
  const timeTaken = data?.timeTaken || 0;
  const totalTime = data?.totalTime || 0;
  const testName = data?.testName || "";
  const total = questions.length;

  // Stats computation
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const subjectMap: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      if (!subjectMap[q.subject]) subjectMap[q.subject] = { correct: 0, total: 0 };
      subjectMap[q.subject].total++;
      if (q.selected === null) {
        skipped++;
      } else if (q.selected === q.correctIndex) {
        correct++;
        subjectMap[q.subject].correct++;
      } else {
        wrong++;
      }
    });

    const scorePercent = Math.round((correct / total) * 100);
    const radarData = Object.entries(subjectMap).map(([subject, s]) => ({
      subject,
      score: Math.round((s.correct / s.total) * 100),
      fullMark: 100,
    }));

    const suggestions: string[] = [];
    Object.entries(subjectMap).forEach(([subject, s]) => {
      const pct = Math.round((s.correct / s.total) * 100);
      if (pct < 50) suggestions.push(`${subject} বিষয়ে আরও অনুশীলন করুন — সঠিকতা মাত্র ${pct}%`);
    });
    if (skipped > 0) suggestions.push(`${skipped}টি প্রশ্ন স্কিপ করেছেন — সব প্রশ্নের উত্তর দেওয়ার চেষ্টা করুন`);
    if (timeTaken < totalTime * 0.4) suggestions.push("আরেকটু সময় নিয়ে ভেবে উত্তর দিলে সঠিকতা বাড়বে");
    if (suggestions.length === 0) suggestions.push("চমৎকার পারফরম্যান্স! চালিয়ে যান! 🌟");

    return { correct, wrong, skipped, scorePercent, radarData, suggestions, subjectMap };
  }, [questions, total, timeTaken, totalTime]);

  const perf = getPerformanceMessage(stats.scorePercent);
  const xpEarned = getXpEarned(stats.scorePercent, total);

  const handleDownloadPDF = () => {
    generateResultPDF({
      testName,
      questions,
      timeTaken,
      totalTime,
      scorePercent: stats.scorePercent,
      correct: stats.correct,
      wrong: stats.wrong,
      skipped: stats.skipped,
    });
  };

  if (!data) return null;

  return (
    <motion.div
      className="min-h-screen bg-background pb-24"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ─── Hero Score Section ─── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary/80 text-secondary-foreground"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />

        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-10 text-center">
          {/* Test name */}
          <p className="text-xs font-medium opacity-60 mb-2">{testName}</p>

          {/* Score ring */}
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 12 }}
            className="mx-auto mb-4"
          >
            <ProgressRing progress={stats.scorePercent} size={140} strokeWidth={10}>
              <div className="text-center">
                <motion.span
                  className="text-4xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {stats.scorePercent}%
                </motion.span>
                <p className="text-[10px] opacity-60 -mt-0.5">স্কোর</p>
              </div>
            </ProgressRing>
          </motion.div>

          {/* Performance message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-3xl mb-1 block">{perf.emoji}</span>
            <h1 className={cn("text-xl font-bold", perf.color)}>{perf.text}</h1>
          </motion.div>

          {/* XP + Rank badges */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-5"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-accent/20 px-4 py-2 text-sm font-bold">
              <Zap className="h-4 w-4 text-accent" />
              +{xpEarned} XP
            </div>
            {realRank && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-4 py-2 text-sm font-bold">
                <Trophy className="h-4 w-4 text-primary" />
                #{realRank} র‍্যাংক
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ─── Quick Stats Grid ─── */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-primary">{stats.correct}</p>
              <p className="text-[11px] text-muted-foreground">সঠিক</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <XCircle className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-2xl font-bold text-destructive">{stats.wrong}</p>
              <p className="text-[11px] text-muted-foreground">ভুল</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{formatTime(timeTaken)}</p>
              <p className="text-[11px] text-muted-foreground">সময়</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Accuracy Bar ─── */}
        <motion.div variants={item}>
          <Card className="card-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  সঠিকতা বিশ্লেষণ
                </h3>
                <span className="text-sm font-bold text-primary">{stats.scorePercent}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-muted-foreground">সঠিক</span>
                  <Progress value={(stats.correct / total) * 100} className="h-2.5 flex-1" />
                  <span className="w-6 text-right font-medium text-primary">{stats.correct}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-muted-foreground">ভুল</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-destructive/70 transition-all duration-700"
                      style={{ width: `${(stats.wrong / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-medium text-destructive">{stats.wrong}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-muted-foreground">স্কিপ</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-muted-foreground/30 transition-all duration-700"
                      style={{ width: `${(stats.skipped / total) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-medium text-muted-foreground">{stats.skipped}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Subject Radar Chart ─── */}
        <motion.div variants={item}>
          <Card className="card-shadow">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" />
                বিষয়ভিত্তিক দক্ষতা
              </h3>
              <RadarChart data={stats.radarData} />
              {/* Subject breakdown list */}
              <div className="mt-3 space-y-2 border-t pt-3">
                {Object.entries(stats.subjectMap).map(([subject, s]) => {
                  const pct = Math.round((s.correct / s.total) * 100);
                  return (
                    <div key={subject} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-foreground flex-1">{subject}</span>
                      <div className="w-20">
                        <Progress value={pct} className="h-1.5" />
                      </div>
                      <span className={cn(
                        "text-xs font-bold w-10 text-right",
                        pct >= 70 ? "text-primary" : pct >= 40 ? "text-accent-foreground" : "text-destructive"
                      )}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Improvement Suggestions ─── */}
        <motion.div variants={item}>
          <Card className="card-shadow border-accent/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-accent" />
                উন্নতির পরামর্শ
              </h3>
              <div className="space-y-2.5">
                {stats.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent-foreground mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── XP & Gamification Summary ─── */}
        <motion.div variants={item}>
          <Card className="card-shadow bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Star className="h-4 w-4 text-accent" />
                অর্জন
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
                  <Zap className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">+{xpEarned}</p>
                  <p className="text-[10px] text-muted-foreground">XP অর্জিত</p>
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
                  <Trophy className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{realRank ? `#${realRank}` : "—"}</p>
                  <p className="text-[10px] text-muted-foreground">লিডারবোর্ড র‍্যাংক</p>
                </div>
              </div>
              {stats.scorePercent >= 80 && (
                <motion.div
                  className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <span className="text-xl">🏅</span>
                  <p className="text-xs font-medium text-primary">নতুন ব্যাজ অর্জন: "মেধাবী পরীক্ষার্থী"</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Question Review (collapsible) ─── */}
        <motion.div variants={item}>
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer rounded-xl bg-card border border-border/50 card-shadow px-4 py-3.5 text-sm font-semibold text-foreground">
              <span>প্রশ্ন পর্যালোচনা ({total}টি)</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-3">
              {questions.map((q, i) => {
                const isCorrect = q.selected === q.correctIndex;
                const isSkipped = q.selected === null;
                return (
                  <Card
                    key={q.id}
                    className={cn(
                      "card-shadow border-l-4",
                      isSkipped
                        ? "border-l-muted-foreground/30"
                        : isCorrect
                          ? "border-l-primary"
                          : "border-l-destructive"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                            {q.subject}
                          </span>
                          <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">{q.text}</p>
                        </div>
                        {isSkipped ? (
                          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">স্কিপ</span>
                        ) : isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1.5 ml-8">
                        {q.options.map((opt, oi) => {
                          const isRight = oi === q.correctIndex;
                          const isUserPick = oi === q.selected;
                          return (
                            <div
                              key={oi}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                                isRight
                                  ? "bg-primary/10 text-primary font-medium"
                                  : isUserPick && !isRight
                                    ? "bg-destructive/10 text-destructive line-through"
                                    : "text-muted-foreground"
                              )}
                            >
                              <span className="font-bold w-4">{optionLabels[oi]}.</span>
                              <span>{opt}</span>
                              {isRight && <CheckCircle className="h-3.5 w-3.5 ml-auto shrink-0" />}
                              {isUserPick && !isRight && <XCircle className="h-3.5 w-3.5 ml-auto shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </details>
        </motion.div>

        {/* ─── PDF Download ─── */}
        <motion.div variants={item}>
          <Button
            variant="outline"
            className="w-full min-h-[52px] gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            📥 রেজাল্ট ডাউনলোড (PDF)
          </Button>
        </motion.div>

        {/* ─── Action Buttons ─── */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            className="min-h-[52px] gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="h-4 w-4" />
            ড্যাশবোর্ড
          </Button>
          <Button
            className="min-h-[52px] gap-2"
            onClick={() => navigate("/dashboard/live-exam")}
          >
            <RotateCcw className="h-4 w-4" />
            আরও পরীক্ষা
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Link to="/dashboard/leaderboard">
            <Button variant="ghost" className="w-full gap-2 text-primary">
              লিডারবোর্ড দেখুন
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
