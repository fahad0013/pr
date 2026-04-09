import { Radio, Users, Clock, ArrowRight, Lock, Loader2, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const toBengali = (n: number | string) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

interface TestInfo {
  id: number;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  questionCount: number;
}

export default function LiveExam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    return (localStorage.getItem("liveExamView") as "list" | "grid") || "list";
  });

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    localStorage.setItem("liveExamView", viewMode);
  }, [viewMode]);

  const loadTests = async () => {
    const { data: testsData } = await (supabase
      .from("tests")
      .select("id, title, description, duration_minutes") as any)
      .eq("test_type", "live")
      .order("id");

    if (testsData) {
      const { data: countData } = await supabase
        .from("questions")
        .select("test_id");

      const counts: Record<number, number> = {};
      countData?.forEach((q: any) => {
        counts[q.test_id] = (counts[q.test_id] || 0) + 1;
      });

      setTests(
        testsData.map((t: any) => ({
          ...t,
          questionCount: counts[t.id] || 0,
        }))
      );
    }
    setLoading(false);
  };

  const handleJoin = (examId: number) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    navigate(`/exam/${examId}`);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "১ ঘণ্টা";
    if (minutes === 60) return "১ ঘণ্টা";
    if (minutes === 80) return "১ ঘণ্টা ২০ মিনিট";
    return `${toBengali(minutes)} মিনিট`;
  };

  if (loading) {
    return (
      <div className="container max-w-2xl py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6 animate-fade-in">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">লাইভ পরীক্ষা</h1>
          <p className="text-sm text-muted-foreground">রিয়েল-টাইমে পরীক্ষায় অংশ নিন</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
          পরীক্ষা দিন
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                : "space-y-3"
            }
          >
            {tests.map((exam) =>
              viewMode === "list" ? (
                <Card key={exam.id} className="border-primary/30 card-shadow">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <Badge className="mb-2 bg-destructive/10 text-destructive hover:bg-destructive/20">
                          <Radio className="mr-1 h-3 w-3" /> লাইভ
                        </Badge>
                        <h3 className="font-semibold">{exam.title}</h3>
                        {exam.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{exam.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatDuration(exam.duration_minutes)}
                      </span>
                      <span>{toBengali(exam.questionCount)} প্রশ্ন</span>
                    </div>
                    <Button
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[44px]"
                      onClick={() => handleJoin(exam.id)}
                    >
                      এখনই যোগ দিন
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card key={exam.id} className="border-primary/30 card-shadow flex flex-col">
                  <CardContent className="p-4 flex flex-col flex-1">
                    <Badge className="mb-2 w-fit bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <Radio className="mr-1 h-3 w-3" /> লাইভ
                    </Badge>
                    <h3 className="font-semibold mb-1">{exam.title}</h3>
                    {exam.description && (
                      <p className="text-xs text-muted-foreground mb-3">{exam.description}</p>
                    )}
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground py-3 border-t border-border/50 mt-auto mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {formatDuration(exam.duration_minutes)}
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span>{toBengali(exam.questionCount)} প্রশ্ন</span>
                    </div>
                    <Button
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[44px]"
                      onClick={() => handleJoin(exam.id)}
                    >
                      এখনই যোগ দিন
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
