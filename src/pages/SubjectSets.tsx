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

const QUESTIONS_PER_SET = 20;

// Map Bengali subject names to their English DB equivalents
const subjectVariants: Record<string, string[]> = {
  "বাংলা": ["বাংলা", "Bangla"],
  "ইংরেজি": ["ইংরেজি", "English"],
  "গণিত": ["গণিত", "Math"],
  "সাধারণ জ্ঞান": ["সাধারণ জ্ঞান", "GK"],
};

const subjectIcons: Record<string, string> = {
  "বাংলা": "📚",
  "ইংরেজি": "🔤",
  "গণিত": "🔢",
  "সাধারণ জ্ঞান": "🌍",
};

interface SetInfo {
  setNumber: number;
  questionIds: number[];
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

    // Get all variant names for this subject
    const variants = subjectVariants[decodedSubject] || [decodedSubject];

    // Fetch all questions matching any variant
    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .in("subject", variants as any)
      .order("id");

    if (!questions || questions.length === 0) {
      setSets([]);
      setLoading(false);
      return;
    }

    // Chunk into sets of 20
    const allIds = (questions as any[]).map((q) => q.id as number);
    const setCount = Math.floor(allIds.length / QUESTIONS_PER_SET);
    const setsData: SetInfo[] = [];

    for (let i = 0; i < setCount; i++) {
      setsData.push({
        setNumber: i + 1,
        questionIds: allIds.slice(i * QUESTIONS_PER_SET, (i + 1) * QUESTIONS_PER_SET),
        completed: false,
        score: null,
      });
    }

    // Check completed sets from results
    if (user && setsData.length > 0) {
      const { data: results } = await supabase
        .from("results")
        .select("subject_scores, total_score, correct_count, wrong_count")
        .eq("user_id", user.id);

      if (results) {
        // We track completion by checking if a result exists with matching subject
        // For simplicity, check results that have this subject in subject_scores
        // and match question count = 20
        const subjectResults = results.filter((r) => {
          if (!r.subject_scores || typeof r.subject_scores !== "object") return false;
          const scores = r.subject_scores as Record<string, any>;
          return variants.some((v) => v in scores);
        });

        // Mark sets as completed based on order of results
        subjectResults.forEach((r, idx) => {
          if (idx < setsData.length) {
            setsData[idx].completed = true;
            setsData[idx].score = r.total_score as number;
          }
        });
      }
    }

    setSets(setsData);
    setLoading(false);
  };

  const handleStartSet = (set: SetInfo) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    // Navigate to exam with subject + set params
    navigate(`/exam/subject?subject=${encodeURIComponent(decodedSubject)}&set=${set.setNumber}`);
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

      {/* Header */}
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
            প্রতিটি সেটে {QUESTIONS_PER_SET}টি প্রশ্ন — {QUESTIONS_PER_SET} নম্বর
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
              key={set.setNumber}
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
                    <span>{QUESTIONS_PER_SET}টি প্রশ্ন</span>
                    <span className="w-px h-3 bg-border" />
                    <span>{QUESTIONS_PER_SET} নম্বর</span>
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
