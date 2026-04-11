import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, TrendingUp, Award, Radio } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface Metrics {
  totalUsers: number;
  activeToday: number;
  totalTestsTaken: number;
  avgScore: number;
}

interface DailyPoint {
  date: string;
  activeUsers: number;
  testsTaken: number;
}

interface LiveExamUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  testTitle: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<DailyPoint[]>([]);
  const [liveUsers, setLiveUsers] = useState<LiveExamUser[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchLiveExamUsers = useCallback(async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: recentResults } = await supabase
      .from("results")
      .select("user_id, test_id, created_at")
      .gt("created_at", thirtyMinAgo)
      .order("created_at", { ascending: false });

    if (!recentResults || recentResults.length === 0) {
      setLiveUsers([]);
      setLiveLoading(false);
      return;
    }

    const latestByUser: Record<string, { test_id: number | null; created_at: string }> = {};
    recentResults.forEach(r => {
      if (r.user_id && !latestByUser[r.user_id]) {
        latestByUser[r.user_id] = { test_id: r.test_id, created_at: r.created_at! };
      }
    });

    const userIds = Object.keys(latestByUser);
    const testIds = [...new Set(Object.values(latestByUser).map(r => r.test_id).filter(Boolean))] as number[];

    const [profilesRes, testsRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds),
      testIds.length > 0 ? supabase.from("tests").select("id, title").in("id", testIds) : Promise.resolve({ data: [] }),
    ]);

    const testsMap: Record<number, string> = {};
    (testsRes.data ?? []).forEach(t => { testsMap[t.id] = t.title; });

    const list: LiveExamUser[] = (profilesRes.data ?? []).map(p => {
      const latest = latestByUser[p.id];
      return {
        userId: p.id,
        displayName: p.display_name || "Unknown",
        avatarUrl: p.avatar_url,
        testTitle: latest?.test_id ? (testsMap[latest.test_id] || "—") : "—",
        createdAt: latest?.created_at || "",
      };
    });

    setLiveUsers(list);
    setLiveLoading(false);
  }, []);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().slice(0, 10);

      const [profilesRes, resultsRes, dailyRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("results").select("total_score"),
        supabase.from("daily_activity").select("*"),
      ]);

      const totalUsers = profilesRes.count ?? 0;
      const results = resultsRes.data ?? [];
      const daily = dailyRes.data ?? [];

      const activeToday = new Set(daily.filter(d => d.activity_date === today).map(d => d.user_id)).size;
      const totalTestsTaken = results.length;
      const avgScore = results.length
        ? Math.round(results.reduce((s, r) => s + (Number(r.total_score) || 0), 0) / results.length)
        : 0;

      setMetrics({ totalUsers, activeToday, totalTestsTaken, avgScore });

      const days: Record<string, { activeUsers: Set<string>; testsTaken: number }> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days[key] = { activeUsers: new Set(), testsTaken: 0 };
      }
      daily.forEach(d => {
        if (days[d.activity_date]) {
          days[d.activity_date].activeUsers.add(d.user_id);
          days[d.activity_date].testsTaken += d.tests_completed ?? 0;
        }
      });
      setChartData(
        Object.entries(days).map(([date, v]) => ({
          date: date.slice(5),
          activeUsers: v.activeUsers.size,
          testsTaken: v.testsTaken,
        }))
      );

      setLoading(false);
    }
    load();
    fetchLiveExamUsers();

    const interval = setInterval(fetchLiveExamUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveExamUsers]);

  function relativeTime(iso: string) {
    if (!iso) return "—";
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "এইমাত্র";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} মিনিট আগে`;
    return `${Math.floor(mins / 60)} ঘণ্টা আগে`;
  }

  const cards = [
    { label: "মোট ব্যবহারকারী", value: metrics?.totalUsers, icon: Users },
    { label: "আজ সক্রিয়", value: metrics?.activeToday, icon: TrendingUp },
    { label: "মোট পরীক্ষা দেওয়া", value: metrics?.totalTestsTaken, icon: BookOpen },
    { label: "গড় স্কোর", value: metrics ? `${metrics.avgScore}%` : undefined, icon: Award },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">{c.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>গত ১৪ দিনের কার্যকলাপ</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="activeUsers" name="সক্রিয় ব্যবহারকারী" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="testsTaken" name="পরীক্ষা" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Live Exam Takers */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="relative">
            <Radio className="h-5 w-5 text-emerald-500" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <CardTitle className="flex items-center gap-2">
            লাইভ পরীক্ষার্থী
            <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-xs">
              Live {liveUsers.length > 0 && `• ${liveUsers.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : liveUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">এখন কেউ পরীক্ষা দিচ্ছে না</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>পরীক্ষার্থী</TableHead>
                  <TableHead>পরীক্ষা</TableHead>
                  <TableHead className="text-right">সময়</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveUsers.map(u => (
                  <TableRow key={u.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatarUrl || undefined} />
                            <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                        </div>
                        <span className="font-medium">{u.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{u.testTitle}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{relativeTime(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
