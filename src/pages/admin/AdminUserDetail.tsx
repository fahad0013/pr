import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy, Flame, BookOpen, Clock, Target, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  district: string | null;
  institution: string | null;
  current_streak: number | null;
}

interface Result {
  id: number;
  total_score: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  created_at: string | null;
  test_id: number | null;
  time_taken: number | null;
  subject_scores: any;
}

interface DailyActivity {
  activity_date: string;
  tests_completed: number | null;
  minutes_spent: number | null;
}

interface Mistake {
  id: number;
  subject: string | null;
  question_text: string | null;
  question_id: number | null;
}

interface BadgeRow {
  badge_type: string;
  earned_at: string;
}

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [tests, setTests] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, district, institution, current_streak").eq("id", userId).single(),
      supabase.from("results").select("id, total_score, correct_count, wrong_count, created_at, test_id, time_taken, subject_scores").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("daily_activity").select("activity_date, tests_completed, minutes_spent").eq("user_id", userId).order("activity_date", { ascending: true }),
      supabase.from("mistakes").select("id, subject, question_text, question_id").eq("user_id", userId),
      supabase.from("badges").select("badge_type, earned_at").eq("user_id", userId),
      supabase.from("tests").select("id, title"),
    ]).then(([profileRes, resultsRes, activityRes, mistakesRes, badgesRes, testsRes]) => {
      if (profileRes.error) toast.error("প্রোফাইল লোড ব্যর্থ");
      else setProfile(profileRes.data);
      setResults(resultsRes.data ?? []);
      setDailyActivity(activityRes.data ?? []);
      setMistakes(mistakesRes.data ?? []);
      setBadges(badgesRes.data ?? []);
      const testMap: Record<number, string> = {};
      (testsRes.data ?? []).forEach((t: any) => { testMap[t.id] = t.title; });
      setTests(testMap);
      setLoading(false);
    });
  }, [userId]);

  const chartHeight = isMobile ? 200 : 250;
  const chartFontSize = isMobile ? 10 : 11;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-muted-foreground">ব্যবহারকারী পাওয়া যায়নি।</p>;
  }

  const scoreData = results.map((r) => ({
    date: r.created_at ? new Date(r.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }) : "",
    score: r.total_score ?? 0,
  }));

  const accuracyData = results.map((r) => {
    const total = (r.correct_count ?? 0) + (r.wrong_count ?? 0);
    return {
      date: r.created_at ? new Date(r.created_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }) : "",
      accuracy: total > 0 ? Math.round(((r.correct_count ?? 0) / total) * 100) : 0,
    };
  });

  const activityData = dailyActivity.slice(-30).map((d) => ({
    date: new Date(d.activity_date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
    tests: d.tests_completed ?? 0,
    minutes: d.minutes_spent ?? 0,
  }));

  const dailyPerf: Record<string, { tests: number; totalScore: number; totalAcc: number; totalTime: number }> = {};
  results.forEach((r) => {
    const dateKey = r.created_at ? new Date(r.created_at).toLocaleDateString("bn-BD") : "unknown";
    if (!dailyPerf[dateKey]) dailyPerf[dateKey] = { tests: 0, totalScore: 0, totalAcc: 0, totalTime: 0 };
    dailyPerf[dateKey].tests++;
    dailyPerf[dateKey].totalScore += r.total_score ?? 0;
    const total = (r.correct_count ?? 0) + (r.wrong_count ?? 0);
    dailyPerf[dateKey].totalAcc += total > 0 ? ((r.correct_count ?? 0) / total) * 100 : 0;
    dailyPerf[dateKey].totalTime += r.time_taken ?? 0;
  });
  const dailyPerfRows = Object.entries(dailyPerf).map(([date, d]) => ({
    date,
    tests: d.tests,
    avgScore: Math.round(d.totalScore / d.tests),
    avgAccuracy: Math.round(d.totalAcc / d.tests),
    totalTime: Math.round(d.totalTime / 60),
  }));

  const subjectAgg: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    if (r.subject_scores && typeof r.subject_scores === "object") {
      Object.entries(r.subject_scores as Record<string, any>).forEach(([subj, val]: [string, any]) => {
        if (!subjectAgg[subj]) subjectAgg[subj] = { correct: 0, total: 0 };
        subjectAgg[subj].correct += val?.correct ?? 0;
        subjectAgg[subj].total += val?.total ?? 0;
      });
    }
  });
  const subjectData = Object.entries(subjectAgg).map(([subject, d]) => ({
    subject,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    total: d.total,
  }));

  const mistakeSubjects: Record<string, number> = {};
  mistakes.forEach((m) => {
    const s = m.subject ?? "অজানা";
    mistakeSubjects[s] = (mistakeSubjects[s] ?? 0) + 1;
  });
  const mistakeSubjectData = Object.entries(mistakeSubjects)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([subject, count]) => ({ subject, count }));

  const questionCount: Record<string, { text: string; count: number }> = {};
  mistakes.forEach((m) => {
    const key = String(m.question_id ?? m.id);
    if (!questionCount[key]) questionCount[key] = { text: m.question_text ?? "—", count: 0 };
    questionCount[key].count++;
  });
  const topWrongQuestions = Object.values(questionCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const badgeColors: Record<string, string> = { gold: "bg-yellow-500", silver: "bg-gray-400", bronze: "bg-amber-700" };

  return (
    <div className="space-y-4 md:space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
        <ArrowLeft className="h-4 w-4 mr-1" /> ফিরে যান
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 shrink-0">
            <AvatarImage src={profile.avatar_url ?? ""} />
            <AvatarFallback className="text-xl">{(profile.display_name ?? "?")[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold truncate">{profile.display_name ?? "নাম নেই"}</h2>
            <p className="text-muted-foreground text-sm">
              {profile.district ?? "—"} • {profile.institution ?? "—"}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="gap-1 text-xs"><Flame className="h-3 w-3" /> স্ট্রিক: {profile.current_streak ?? 0}</Badge>
              <Badge variant="outline" className="gap-1 text-xs"><BookOpen className="h-3 w-3" /> পরীক্ষা: {results.length}</Badge>
              {badges.map((b) => (
                <Badge key={b.badge_type} className={`${badgeColors[b.badge_type] ?? "bg-primary"} text-white gap-1 text-xs`}>
                  <Trophy className="h-3 w-3" /> {b.badge_type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><Target className="h-4 w-4" /> স্কোর ট্রেন্ড</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {scoreData.length === 0 ? <p className="text-muted-foreground text-sm">ডেটা নেই</p> : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={chartFontSize} />
                  <YAxis fontSize={chartFontSize} width={isMobile ? 30 : 40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={!isMobile && { r: 3 }} name="স্কোর" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><Target className="h-4 w-4" /> নির্ভুলতা ট্রেন্ড (%)</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {accuracyData.length === 0 ? <p className="text-muted-foreground text-sm">ডেটা নেই</p> : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={chartFontSize} />
                  <YAxis domain={[0, 100]} fontSize={chartFontSize} width={isMobile ? 30 : 40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} dot={!isMobile && { r: 3 }} name="নির্ভুলতা %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><Clock className="h-4 w-4" /> দৈনিক কার্যকলাপ</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {activityData.length === 0 ? <p className="text-muted-foreground text-sm">ডেটা নেই</p> : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" fontSize={chartFontSize} />
                  <YAxis fontSize={chartFontSize} width={isMobile ? 30 : 40} />
                  <Tooltip />
                  {!isMobile && <Legend />}
                  <Bar dataKey="tests" fill="hsl(var(--primary))" name="পরীক্ষা" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minutes" fill="hsl(var(--secondary))" name="মিনিট" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><BookOpen className="h-4 w-4" /> বিষয়ভিত্তিক পারফরম্যান্স</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {subjectData.length === 0 ? <p className="text-muted-foreground text-sm">ডেটা নেই</p> : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={subjectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} fontSize={chartFontSize} />
                  <YAxis dataKey="subject" type="category" width={isMobile ? 70 : 100} fontSize={chartFontSize} />
                  <Tooltip />
                  <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="নির্ভুলতা %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Table */}
      <Card>
        <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base">দৈনিক পারফরম্যান্স সারণি</CardTitle></CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          {dailyPerfRows.length === 0 ? <p className="text-muted-foreground text-sm">কোনো ডেটা নেই</p> : (
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">তারিখ</TableHead>
                    <TableHead className="whitespace-nowrap">পরীক্ষা</TableHead>
                    <TableHead className="whitespace-nowrap">গড় স্কোর</TableHead>
                    <TableHead className="whitespace-nowrap">নির্ভুলতা %</TableHead>
                    <TableHead className="whitespace-nowrap">সময় (মিনিট)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyPerfRows.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                      <TableCell>{row.tests}</TableCell>
                      <TableCell>{row.avgScore}</TableCell>
                      <TableCell>{row.avgAccuracy}%</TableCell>
                      <TableCell>{row.totalTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mistake Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> সবচেয়ে বেশি ভুল বিষয়</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {mistakeSubjectData.length === 0 ? <p className="text-muted-foreground text-sm">কোনো ভুল নেই</p> : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={mistakeSubjectData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="subject" fontSize={chartFontSize} />
                  <YAxis fontSize={chartFontSize} width={isMobile ? 30 : 40} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--destructive))" name="ভুল সংখ্যা" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 md:p-6"><CardTitle className="text-sm md:text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> বারবার ভুল প্রশ্ন</CardTitle></CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            {topWrongQuestions.length === 0 ? <p className="text-muted-foreground text-sm">কোনো ভুল নেই</p> : (
              <div className="space-y-2 max-h-[250px] overflow-auto">
                {topWrongQuestions.map((q, i) => (
                  <div key={i} className="flex justify-between items-start gap-2 p-2 rounded-md bg-muted/50">
                    <p className="text-xs md:text-sm flex-1 line-clamp-2">{q.text}</p>
                    <Badge variant="destructive" className="shrink-0 text-xs">{q.count}x</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
