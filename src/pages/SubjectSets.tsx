import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { motion } from "framer-motion";

const subjectDisplayName: Record<string, string> = {
  "Bangla": "বাংলা",
  "English": "ইংরেজি",
  "Math": "গণিত",
  "GK": "সাধারণ জ্ঞান",
};

const subjectIcons: Record<string, string> = {
  "Bangla": "📚",
  "English": "🔤",
  "Math": "🔢",
  "GK": "🌍",
  "বাংলা": "📚",
  "ইংরেজি": "🔤",
  "গণিত": "🔢",
  "সাধারণ জ্ঞান": "🌍",
};

interface SetInfo {
  testId: number;
  setNumber: number;
  title: string;
  questionCount: number;
  completed: boolean;
  score: number | null;
}

export default function SubjectSets() {
  const navigate = useNavigate();
  const { subject } = useParams<{ subject: string }>();
  const decodedSubject = decodeURIComponent(subject || "");
  const { user } = useAuth();
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  useEffect(() => {
    if (decodedSubject) loadSets();
  }, [decodedSubject, user]);

  const loadSets = async () => {
    setLoading(true);

    // Fetch tests with matching subject_category and test_type='subject'
    const { data: tests } = await supabase
      .from("tests")
      .select("id, title")
      .eq("test_type" as any, "subject")
      .eq("subject_category" as any, decodedSubject)
      .order("id");

    if (!tests || tests.length === 0) {
      setSets([]);
      setLoading(false);
      return;
    }

    const testIds = tests.map((t: any) => t.id);

    // Count questions per test
    const { data: questions } = await supabase
      .from("questions")
      .select("test_id")
      .in("test_id", testIds);

    const qCount: Record<number, number> = {};
    questions?.forEach((q: any) => {
      qCount[q.test_id] = (qCount[q.test_id] || 0) + 1;
    });

    // Check completed tests
    let completedMap: Record<number, number | null> = {};
    if (user) {
      const { data: results } = await supabase
        .from("results")
        .select("test_id, total_score")
        .eq("user_id", user.id)
        .in("test_id", testIds);

      results?.forEach((r: any) => {
        completedMap[r.test_id] = r.total_score;
      });
    }

    const setsData: SetInfo[] = tests.map((t: any, idx: number) => ({
      testId: t.id,
      setNumber: idx + 1,
      title: t.title,
      questionCount: qCount[t.id] || 0,
      completed: t.id in completedMap,
      score: completedMap[t.id] ?? null,
    }));

    setSets(setsData);
    setLoading(false);
  };

  const handleStartSet = (set: SetInfo) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    navigate(`/exam/${set.testId}`);
  };

  const displayName = subjectDisplayName[decodedSubject] || decodedSubject;
  const icon = subjectIcons[decodedSubject] || "📝";

  return (
    <div className="container max-w-2xl py-6 animate-fade-in space-y-6">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/subjects")}
          className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{icon}</span> {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            প্রতিটি সেটে ২০টি প্রশ্ন — ২০ নম্বর
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">এই বিষয়ে কোনো প্রশ্ন পাওয়া যায়নি</p>
          <Button variant="outline" onClick={() => navigate("/dashboard/subjects")}>
            ফিরে যান
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sets.map((set, idx) => (
            <motion.div
              key={set.testId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card
                className={`card-shadow hover-scale cursor-pointer transition-all ${
                  set.completed ? "border-primary/40" : "border-border"
                }`}
                onClick={() => handleStartSet(set)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      {displayName} সেট {set.setNumber}
                    </h3>
                    {set.completed && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        সম্পন্ন
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>{set.questionCount}টি প্রশ্ন</span>
                    <span className="w-px h-3 bg-border" />
                    <span>{set.questionCount} নম্বর</span>
                    {set.score !== null && (
                      <>
                        <span className="w-px h-3 bg-border" />
                        <span className="text-primary font-medium">স্কোর: {set.score}%</span>
                      </>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-1.5 min-h-[40px]"
                    onClick={(e) => { e.stopPropagation(); handleStartSet(set); }}
                  >
                    {set.completed ? "আবার পরীক্ষা দিন" : "পরীক্ষা দিন"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
