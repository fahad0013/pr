import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface SubjectAccuracy {
  subject: string;
  accuracy: number;
}

interface FailedQuestion {
  question_id: number;
  question_text: string | null;
  subject: string | null;
  count: number;
}

export default function AdminAnalytics() {
  const [subjectData, setSubjectData] = useState<SubjectAccuracy[]>([]);
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Subject accuracy from results.subject_scores
      const { data: results, error: rErr } = await supabase.from("results").select("subject_scores");
      if (rErr) toast.error("ফলাফল লোড ব্যর্থ");

      const subjectTotals: Record<string, { correct: number; total: number }> = {};
      (results ?? []).forEach((r) => {
        if (r.subject_scores && typeof r.subject_scores === "object" && !Array.isArray(r.subject_scores)) {
          const scores = r.subject_scores as Record<string, { correct?: number; total?: number }>;
          Object.entries(scores).forEach(([subj, val]) => {
            if (!subjectTotals[subj]) subjectTotals[subj] = { correct: 0, total: 0 };
            subjectTotals[subj].correct += val?.correct ?? 0;
            subjectTotals[subj].total += val?.total ?? 0;
          });
        }
      });
      setSubjectData(
        Object.entries(subjectTotals)
          .filter(([, v]) => v.total > 0)
          .map(([subject, v]) => ({
            subject,
            accuracy: Math.round((v.correct / v.total) * 100),
          }))
      );

      // Most failed questions
      const { data: mistakes, error: mErr } = await supabase.from("mistakes").select("question_id, question_text, subject");
      if (mErr) toast.error("ভুল প্রশ্ন লোড ব্যর্থ");

      const counts: Record<number, FailedQuestion> = {};
      (mistakes ?? []).forEach((m) => {
        if (!m.question_id) return;
        if (!counts[m.question_id]) {
          counts[m.question_id] = { question_id: m.question_id, question_text: m.question_text, subject: m.subject, count: 0 };
        }
        counts[m.question_id].count++;
      });
      setFailedQuestions(
        Object.values(counts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      );

      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">অ্যানালিটিক্স</h2>

      <Card>
        <CardHeader><CardTitle>বিষয়ভিত্তিক সঠিকতা (%)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : subjectData.length === 0 ? (
            <p className="text-muted-foreground">পর্যাপ্ত ডেটা নেই।</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>সবচেয়ে বেশি ভুল হওয়া ১০টি প্রশ্ন</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : failedQuestions.length === 0 ? (
            <p className="text-muted-foreground">ডেটা পাওয়া যায়নি।</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>প্রশ্ন</TableHead>
                  <TableHead>বিষয়</TableHead>
                  <TableHead>ভুলের সংখ্যা</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedQuestions.map((q, i) => (
                  <TableRow key={q.question_id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{q.question_text ?? `Q#${q.question_id}`}</TableCell>
                    <TableCell>{q.subject ?? "—"}</TableCell>
                    <TableCell>{q.count}</TableCell>
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
