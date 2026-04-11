import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, TrendingUp, Award, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

interface ActiveUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastTestTitle: string | null;
  lastTestTime: string | null;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<DailyPoint[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Build chart data (last 14 days)
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

      // Fetch active users for today with their latest exam
      const todayUserIds = [...new Set(daily.filter(d => d.activity_date === today).map(d => d.user_id))];

      if (todayUserIds.length > 0) {
        const [profilesData, resultsData] = await Promise.all([
          supabase.from("profiles").select("id, display_name, avatar_url").in("id", todayUserIds),
          supabase.from("results").select("user_id, test_id, created_at").in("user_id", todayUserIds).order("created_at", { ascending: false }),
        ]);

        const profiles = profilesData.data ?? [];
        const userResults = resultsData.data ?? [];

        // Get unique test IDs for the latest results
        const latestResultByUser: Record<string, { test_id: number | null; created_at: string | null }> = {};
        userResults.forEach(r => {
          if (!latestResultByUser[r.user_id!]) {
            latestResultByUser[r.user_id!] = { test_id: r.test_id, created_at: r.created_at };
          }
        });

        const testIds = [...new Set(Object.values(latestResultByUser).map(r => r.test_id).filter(Boolean))] as number[];
        let testsMap: Record<number, string> = {};
        if (testIds.length > 0) {
          const testsData = await supabase.from("tests").select("id, title").in("id", testIds);
          (testsData.data ?? []).forEach(t => { testsMap[t.id] = t.title; });
        }

        const activeList: ActiveUser[] = profiles.map(p => {
          const latest = latestResultByUser[p.id];
          return {
            userId: p.id,
            displayName: p.display_name || "Unknown",
            avatarUrl: p.avatar_url,
            lastTestTitle: latest?.test_id ? (testsMap[latest.test_id] || null) : null,
            lastTestTime: latest?.created_at || null,
          };
        });
        setActiveUsers(activeList);
      } else {
        setActiveUsers([]);
      }

      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "মোট ব্যবহারকারী", value: metrics?.totalUsers, icon: Users },
    { label: "আজ সক্রিয়", value: metrics?.activeToday, icon: TrendingUp },
    { label: "মোট পরীক্ষা দেওয়া", value: metrics?.totalTestsTaken, icon: BookOpen },
    { label: "গড় স্কোর", value: metrics ? `${metrics.avgScore}%` : undefined, icon: Award },
  ];

  function formatTime(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
  }

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

      {/* Active Users & Current Exams */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>সক্রিয় ব্যবহারকারী ও পরীক্ষা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : activeUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">আজ কেউ সক্রিয় নেই</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ব্যবহারকারী</TableHead>
                  <TableHead>সর্বশেষ পরীক্ষা</TableHead>
                  <TableHead className="text-right">সময়</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map(u => (
                  <TableRow key={u.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatarUrl || undefined} />
                          <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{u.lastTestTitle || "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatTime(u.lastTestTime)}</TableCell>
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