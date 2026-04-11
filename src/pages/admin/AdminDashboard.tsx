import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
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

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profilesRes, resultsRes, dailyRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("results").select("total_score"),
        supabase.from("daily_activity").select("*"),
      ]);

      const totalUsers = profilesRes.count ?? 0;
      const results = resultsRes.data ?? [];
      const daily = dailyRes.data ?? [];

      const today = new Date().toISOString().slice(0, 10);
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
    </div>
  );
}
