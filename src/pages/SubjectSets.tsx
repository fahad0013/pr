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

const subjectIcons: Record<string, string> = {
  "বাংলা": "📚",
  "ইংরেজি": "🔤",
  "গণিত": "🔢",
  "সাধারণ জ্ঞান": "🌍",
};

// Map canonical Bengali names to all DB variants
const subjectVariantsMap: Record<string, string[]> = {
  "বাংলা": ["বাংলা", "Bangla"],
  "ইংরেজি": ["ইংরেজি", "English"],
  "গণিত": ["গণিত", "Math"],
  "সাধারণ জ্ঞান": ["সাধারণ জ্ঞান", "GK"],
};

interface SetInfo {
  testId: number;
  setNumber: number;
  testTitle: string;
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

    const variants = subjectVariantsMap[decodedSubject] || [decodedSubject];

    // Get all questions matching this category (including variants)
    const { data: questions } = await supabase
      .from("questions")
      .select("test_id, category")
      .in("category", variants as any);

    if (!questions || questions.length === 0) {
      setSets([]);
      setLoading(false);
      return;
    }

    // Group by test_id and count
    const testMap: Record<number, number> = {};
    questions.forEach((q: any) => {
      if (!q.test_id) return;
      testMap[q.test_id] = (testMap[q.test_id] || 0) + 1;
    });

    const testIds = Object.keys(testMap).map(Number);

    // Fetch test titles
    const { data: tests } = await supabase
      .from("tests")
      .select("id, title")
      .in("id", testIds as any)
      .order("id");

    const titleMap: Record<number, string> = {};
    tests?.forEach((t: any) => { titleMap[t.id] = t.title; });

    // Check completed tests for logged-in user
    let completedMap: Record<number, number | null> = {};
    if (user) {
      const { data: results } = await supabase
        .from("results")
        .select("test_id, total_score")
        .eq("user_id", user.id)
        .in("test_id", testIds as any);

      results?.forEach((r: any) => {
        completedMap[r.test_id] = r.total_score;
      });
    }

    // Sort by test_id and build sets
    const sortedIds = testIds.sort((a, b) => a - b);
    const setsData: SetInfo[] = sortedIds.map((tid, idx) => ({
      testId: tid,
      setNumber: idx + 1,
      testTitle: titleMap[tid] || `সেট ${idx + 1}`,
      questionCount: testMap[tid],
      completed: tid in completedMap,
      score: completedMap[tid] ?? null,
    }));

    setSets(setsData);
    setLoading(false);
  };

  const handleStartSet = (set: SetInfo) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    // Navigate with subject filter so ExamRoom filters by category + test_id
    navigate(`/exam/${set.testId}?subject=${encodeURIComponent(decodedSubject)}`);
  };

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
            <span>{icon}</span> {decodedSubject}
          </h1>
          <p className="text-sm text-muted-foreground">
            প্রতিটি সেটে বিষয়ভিত্তিক প্রশ্ন রয়েছে
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
                      {decodedSubject} সেট {set.setNumber}
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
