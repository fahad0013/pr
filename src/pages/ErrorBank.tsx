import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookX, RotateCcw, Loader2, Trash2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface MistakeRow {
  id: number;
  question_id: number;
  test_id: number;
  subject: string | null;
  question_text: string | null;
  correct_answer: string | null;
  user_answer: string | null;
  created_at: string;
}

interface SubjectGroup {
  subject: string;
  count: number;
  mistakes: MistakeRow[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function ErrorBank() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<MistakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState("all");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadMistakes();
  }, [user]);

  const loadMistakes = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMistakes((data || []) as MistakeRow[]);
    setLoading(false);
  };

  const deleteMistake = async (id: number) => {
    await supabase.from("mistakes").delete().eq("id", id);
    setMistakes((prev) => prev.filter((m) => m.id !== id));
  };

  // Group by subject
  const grouped: SubjectGroup[] = [];
  const subjectMap = new Map<string, MistakeRow[]>();
  mistakes.forEach((m) => {
    const subj = m.subject || "অন্যান্য";
    if (!subjectMap.has(subj)) subjectMap.set(subj, []);
    subjectMap.get(subj)!.push(m);
  });
  subjectMap.forEach((items, subject) => {
    grouped.push({ subject, count: items.length, mistakes: items });
  });

  const filtered = activeSubject === "all"
    ? mistakes
    : mistakes.filter((m) => (m.subject || "অন্যান্য") === activeSubject);

  const subjects = grouped.map((g) => g.subject);
  const totalMistakes = mistakes.length;

  const handleRevisionExam = () => {
    if (activeSubject === "all") {
      navigate("/exam/revision?mode=revision");
    } else {
      navigate(`/exam/revision?mode=revision&subject=${encodeURIComponent(activeSubject)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (totalMistakes === 0) {
    return (
      <motion.div
        className="container max-w-2xl py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Inbox className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">ভুল উত্তরের খাতা খালি! 🎉</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            পরীক্ষা দিন — ভুল উত্তরগুলো এখানে স্বয়ংক্রিয়ভাবে জমা হবে।
          </p>
          <Button onClick={() => navigate("/dashboard/live-exam")} className="min-h-[44px]">
            পরীক্ষা দিন
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container max-w-2xl py-6 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookX className="h-6 w-6 text-destructive" />
          ভুল উত্তরের খাতা
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          মোট {totalMistakes}টি ভুল — রিভিশন করে সঠিক করুন
        </p>
      </motion.div>

      {/* Subject summary cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {grouped.map((g) => (
          <Card key={g.subject} className="card-shadow">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{g.subject}</span>
                <span className="text-lg font-bold text-destructive">{g.count}</span>
              </div>
              <Progress
                value={(g.count / totalMistakes) * 100}
                className="h-1.5"
              />
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Revision Exam CTA */}
      <motion.div variants={item}>
        <Button
          className="w-full min-h-[52px] text-base font-semibold gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={handleRevisionExam}
        >
          <RotateCcw className="h-5 w-5" />
          রিভিশন পরীক্ষা দিন ({activeSubject === "all" ? totalMistakes : filtered.length}টি প্রশ্ন)
        </Button>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={item}>
        <Tabs value={activeSubject} onValueChange={setActiveSubject}>
          <TabsList className="w-full overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="flex-shrink-0">সব ({totalMistakes})</TabsTrigger>
            {subjects.map((s) => (
              <TabsTrigger key={s} value={s} className="flex-shrink-0">
                {s} ({subjectMap.get(s)?.length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Mistake list */}
      <div className="space-y-3">
        {filtered.map((m, i) => (
          <motion.div key={m.id} variants={item}>
            <Card className="card-shadow border-l-4 border-l-destructive/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[11px] font-bold text-destructive mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    {m.subject && (
                      <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                        {m.subject}
                      </span>
                    )}
                    <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">
                      {m.question_text || `প্রশ্ন #${m.question_id}`}
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      {m.user_answer && (
                        <p className="text-destructive">
                          <span className="font-medium">আপনার উত্তর:</span> {m.user_answer}
                        </p>
                      )}
                      {m.correct_answer && (
                        <p className="text-primary">
                          <span className="font-medium">সঠিক উত্তর:</span> {m.correct_answer}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMistake(m.id)}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
