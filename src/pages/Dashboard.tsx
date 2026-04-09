import { useState, useEffect } from "react";
import {
  ArrowRight,
  RotateCcw,
  Play,
  Target,
  TrendingUp,
  Medal,
  Zap,
  Trophy,
  BookX,
  ChevronRight,
  Radio,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { RadarChart } from "@/components/RadarChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useBadges } from "@/hooks/useBadges";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { BadgeCelebration } from "@/components/BadgeCelebration";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function getLevelTitle(level: number) {
  const titles = [
    "নবীন",
    "শিক্ষানবিশ",
    "অনুশীলনকারী",
    "নিয়মিত",
    "পরিশ্রমী",
    "দক্ষ",
    "মেধাবী",
    "বিশেষজ্ঞ",
    "মাস্টার",
    "কিংবদন্তি",
  ];
  return titles[Math.min(level - 1, titles.length - 1)];
}

interface DashboardData {
  displayName: string;
  avatarUrl: string | null;
  streak: number;
  dailyGoal: number;
  dailyDone: number;
  totalTests: number;
  accuracy: number;
  totalScore: number;
  rank: number | null;
  mistakesBySubject: { subject: string; count: number; emoji: string }[];
  radarData: { subject: string; score: number; fullMark: number }[];
  leaderboard: { rank: number; name: string; score: number; avatar: string }[];
  tests: { id: number; title: string; questionCount: number }[];
}

const subjectEmojis: Record<string, string> = {
  বাংলা: "📚",
  ইংরেজি: "🔤",
  গণিত: "🔢",
  "সাধারণ জ্ঞান": "🌍",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const { badges, newBadge, dismissCelebration, checkAndAward } = useBadges();

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    checkAndAward();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);

    // Parallel queries
    const [profileRes, resultsRes, mistakesRes, testsRes, leaderboardRes, dailyRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "display_name, avatar_url, current_streak, daily_goal_minutes"
          )
          .eq("id", user.id)
          .single(),
        supabase
          .from("results")
          .select("total_score, correct_count, wrong_count, subject_scores")
          .eq("user_id", user.id),
        supabase
          .from("mistakes")
          .select("subject")
          .eq("user_id", user.id),
        supabase.from("tests").select("id, title").limit(5),
        supabase
          .from("results")
          .select("user_id, total_score"),
        supabase
          .from("daily_activity" as any)
          .select("minutes_spent, tests_completed")
          .eq("user_id", user.id)
          .eq("activity_date", new Date().toISOString().split("T")[0])
          .single(),
      ]);

    const profile = profileRes.data;
    const results = resultsRes.data || [];
    const mistakes = mistakesRes.data || [];
    const tests = testsRes.data || [];

    // Calculate stats
    const totalTests = results.length;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalScoreSum = 0;
    const subjectScores: Record<string, { correct: number; total: number }> =
      {};

    results.forEach((r: any) => {
      totalCorrect += r.correct_count || 0;
      totalWrong += r.wrong_count || 0;
      totalScoreSum += Number(r.total_score || 0);
      if (r.subject_scores && typeof r.subject_scores === "object") {
        Object.entries(r.subject_scores as Record<string, any>).forEach(
          ([subj, s]: [string, any]) => {
            if (!subjectScores[subj])
              subjectScores[subj] = { correct: 0, total: 0 };
            subjectScores[subj].correct += s.correct || 0;
            subjectScores[subj].total += s.total || 0;
          }
        );
      }
    });

    const accuracy =
      totalCorrect + totalWrong > 0
        ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
        : 0;

    // Mistakes by subject
    const mistakeMap: Record<string, number> = {};
    (mistakes as any[]).forEach((m: any) => {
      const subj = m.subject || "অন্যান্য";
      mistakeMap[subj] = (mistakeMap[subj] || 0) + 1;
    });
    const mistakesBySubject = Object.entries(mistakeMap).map(
      ([subject, count]) => ({
        subject,
        count,
        emoji: subjectEmojis[subject] || "📝",
      })
    );

    // Radar data
    const radarData = Object.entries(subjectScores).map(([subject, s]) => ({
      subject,
      score: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      fullMark: 100,
    }));

    // Leaderboard: aggregate all users' scores
    const allResults = leaderboardRes.data || [];
    const userScores: Record<string, number> = {};
    allResults.forEach((r: any) => {
      if (r.user_id && r.total_score) {
        userScores[r.user_id] =
          (userScores[r.user_id] || 0) + Number(r.total_score);
      }
    });
    const sortedUsers = Object.entries(userScores)
      .sort(([, a], [, b]) => b - a);
    
    const myRankIndex = sortedUsers.findIndex(([id]) => id === user.id);
    const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;

    const top3Ids = sortedUsers.slice(0, 3).map(([id]) => id);
    let leaderboard: DashboardData["leaderboard"] = [];
    if (top3Ids.length > 0) {
      const { data: lbProfiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", top3Ids);
      const nameMap: Record<string, string> = {};
      lbProfiles?.forEach((p) => {
        nameMap[p.id] = p.display_name || "ব্যবহারকারী";
      });
      leaderboard = sortedUsers.slice(0, 3).map(([id, score], i) => ({
        rank: i + 1,
        name: nameMap[id] || "ব্যবহারকারী",
        score: Math.round(score),
        avatar: i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉",
      }));
    }

    // Get question counts for tests
    const testList = await Promise.all(
      tests.map(async (t: any) => {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("test_id", t.id);
        return { id: t.id, title: t.title, questionCount: count || 0 };
      })
    );

    // Calculate XP from totalScore
    const xp = Math.round(totalScoreSum * 10);
    const level = Math.max(1, Math.floor(xp / 500) + 1);

    setData({
      displayName:
        profile?.display_name ||
        user.user_metadata?.full_name ||
        "শিক্ষার্থী",
      avatarUrl:
        profile?.avatar_url || user.user_metadata?.avatar_url || null,
      streak: profile?.current_streak || 0,
      dailyGoal: profile?.daily_goal_minutes || 60,
      dailyDone: (dailyRes.data as any)?.minutes_spent || 0,
      totalTests,
      accuracy,
      totalScore: Math.round(totalScoreSum),
      rank: myRank,
      mistakesBySubject,
      radarData,
      leaderboard,
      tests: testList,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const xp = data.totalScore * 10;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const xpForNext = level * 500;
  const xpPercent = Math.round((xp / xpForNext) * 100);
  const dailyPercent =
    data.dailyGoal > 0
      ? Math.round((data.dailyDone / data.dailyGoal) * 100)
      : 0;
  const name = data.displayName.split(" ")[0];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "শুভ সকাল";
    if (h < 17) return "শুভ দুপুর";
    if (h < 20) return "শুভ সন্ধ্যা";
    return "শুভ রাত";
  };

  return (
    <motion.div
      className="container max-w-2xl py-5 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
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
              <p className="text-sm opacity-70">{getGreeting()} 👋</p>
              <h2 className="text-2xl font-bold leading-tight">
                {name}, আজ কতটুকু করবে?
              </h2>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 border-2 border-accent/40">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <span className="mt-1 text-[10px] font-semibold text-accent">
                Lv.{level}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <StreakBadge count={data.streak} />
            <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
              <Zap className="h-4 w-4 text-accent" />
              <span>{Math.round(xp).toLocaleString()} XP</span>
            </div>
            <span className="text-xs rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
              {getLevelTitle(level)}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-70">
              <span>পরবর্তী লেভেল</span>
              <span>
                {Math.round(xp)}/{xpForNext} XP
              </span>
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
                  {data.dailyDone} / {data.dailyGoal} মিনিট সম্পন্ন
                </p>
                <p className="text-xs text-primary font-medium mt-1">
                  {data.dailyGoal - data.dailyDone > 0
                    ? `আরও ${data.dailyGoal - data.dailyDone} মিনিট — চালিয়ে যাও! 💪`
                    : "🎉 আজকের লক্ষ্য পূরণ!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ─── Start New Test ─── */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-1.5">
            <Play className="h-4 w-4 text-primary" />
            নতুন পরীক্ষা শুরু করুন
          </h2>
          <Link
            to="/dashboard/live-exam"
            className="text-xs font-medium text-primary hover:underline"
          >
            সব দেখুন
          </Link>
        </div>
        <div className="space-y-2.5">
          {data.tests.length > 0 ? (
            data.tests.map((test) => (
              <Card key={test.id} className="card-shadow hover-scale cursor-pointer">
                <CardContent className="flex items-center gap-3 p-3.5">
                  <span className="text-2xl">🏫</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {test.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {test.questionCount} প্রশ্ন
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 gap-1 min-h-[36px]"
                    onClick={() => navigate(`/exam/${test.id}`)}
                  >
                    শুরু
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="card-shadow">
              <CardContent className="p-4 text-center text-muted-foreground text-sm">
                কোনো টেস্ট পাওয়া যায়নি
              </CardContent>
            </Card>
          )}
        </div>
      </motion.section>

      {/* ─── Quick Stats ─── */}
      <motion.section variants={item}>
        <h2 className="text-base font-semibold mb-3">আপনার পরিসংখ্যান</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">
                {data.accuracy}%
              </p>
              <p className="text-xs text-muted-foreground">সঠিকতা</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">
                {data.totalTests}
              </p>
              <p className="text-xs text-muted-foreground">মোট পরীক্ষা</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Medal className="h-5 w-5 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">
                {data.rank ? `#${data.rank}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">সার্বিক র‍্যাংক</p>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-4 text-center">
              <Zap className="h-5 w-5 text-accent mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-foreground">
                {Math.round(xp).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">মোট XP</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* ─── Badges ─── */}
      <motion.section variants={item}>
        <h2 className="text-base font-semibold mb-3">অর্জিত ব্যাজ 🏅</h2>
        <Card className="card-shadow">
          <CardContent className="p-4">
            <BadgeDisplay badges={badges} />
          </CardContent>
        </Card>
      </motion.section>

      {/* Badge Celebration Overlay */}
      <BadgeCelebration badge={newBadge} onDismiss={dismissCelebration} />

      {/* ─── Subject Analytics ─── */}
      {data.radarData.length > 0 && (
        <motion.section variants={item}>
          <h2 className="text-base font-semibold mb-3">
            বিষয়ভিত্তিক দক্ষতা 📊
          </h2>
          <Card className="card-shadow">
            <CardContent className="p-4">
              <RadarChart data={data.radarData} />
              {/* Subject bar chart */}
              <div className="mt-4 space-y-2.5 border-t pt-3">
                {data.radarData.map((d) => {
                  const color = d.score >= 70 ? "bg-primary" : d.score >= 40 ? "bg-accent" : "bg-destructive";
                  const textColor = d.score >= 70 ? "text-primary" : d.score >= 40 ? "text-accent-foreground" : "text-destructive";
                  return (
                    <div key={d.subject} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-foreground w-20 truncate">{d.subject}</span>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", color)}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                      <span className={cn("text-xs font-bold w-10 text-right", textColor)}>
                        {d.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* ─── Mistake Tracker ─── */}
      {data.mistakesBySubject.length > 0 && (
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <BookX className="h-4 w-4 text-destructive" />
              ভুল উত্তরের খাতা
            </h2>
            <Link
              to="/dashboard/error-bank"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              সব দেখুন <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Card className="card-shadow">
            <CardContent className="p-4 space-y-2.5">
              {data.mistakesBySubject.map((m) => (
                <div key={m.subject} className="flex items-center gap-3">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {m.subject}
                  </span>
                  <div className="w-24">
                    <Progress
                      value={(m.count / 30) * 100}
                      className="h-1.5"
                    />
                  </div>
                  <span className="text-xs text-destructive font-semibold w-12 text-right">
                    {m.count}টি
                  </span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[42px] border-destructive/30 text-destructive hover:bg-destructive/10 text-sm"
                  onClick={() =>
                    navigate("/exam/revision?mode=revision")
                  }
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  রিভিশন পরীক্ষা
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 min-h-[42px] text-sm"
                  onClick={() => navigate("/dashboard/error-bank")}
                >
                  <BookX className="mr-1.5 h-4 w-4" />
                  সব ভুল দেখুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* ─── Leaderboard Preview ─── */}
      {data.leaderboard.length > 0 && (
        <motion.section variants={item}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-accent" />
              এই সপ্তাহের সেরা
            </h2>
            <Link
              to="/dashboard/leaderboard"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
            >
              সব দেখুন <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Card className="card-shadow">
            <CardContent className="p-0 divide-y divide-border/50">
              {data.leaderboard.map((u) => (
                <div
                  key={u.rank}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="text-xl w-7 text-center">{u.avatar}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {u.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {u.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {u.score.toLocaleString()}
                  </span>
                </div>
              ))}
              {data.rank && (
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/5">
                  <span className="text-sm font-bold w-7 text-center text-primary">
                    #{data.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      আপনি
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {data.totalScore.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* ─── Motivational Footer ─── */}
      <motion.section variants={item} className="text-center pt-2 pb-4">
        <p className="text-sm text-muted-foreground italic">
          "প্রতিদিন একটু একটু করে এগিয়ে যাও — সাফল্য আসবেই!" ✨
        </p>
      </motion.section>
    </motion.div>
  );
}
