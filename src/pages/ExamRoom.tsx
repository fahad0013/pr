import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Clock,
  X,
  CheckCircle,
  AlertTriangle,
  Grid3X3,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/* ── Types ── */
interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  subject: string;
}

interface AnswerState {
  selected: number | null;
  marked: boolean;
}

const DEFAULT_EXAM_DURATION = 60 * 60; // 60 minutes default

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const optionLabels = ["ক", "খ", "গ", "ঘ"];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

// Map Bengali subject names to their English DB equivalents
const subjectVariantsMap: Record<string, string[]> = {
  "বাংলা": ["বাংলা", "Bangla"],
  "ইংরেজি": ["ইংরেজি", "English"],
  "গণিত": ["গণিত", "Math"],
  "সাধারণ জ্ঞান": ["সাধারণ জ্ঞান", "GK"],
};

export default function ExamRoom() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isRevision = searchParams.get("mode") === "revision";
  const revisionSubject = searchParams.get("subject");
  const subjectFilter = searchParams.get("subject");
  const isSubjectMode = !isRevision && !!subjectFilter;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [examDuration, setExamDuration] = useState(DEFAULT_EXAM_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_EXAM_DURATION);
  const [testTitle, setTestTitle] = useState("পরীক্ষা");
  const [dir, setDir] = useState(1);
  const [showNav, setShowNav] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load questions from Supabase
  useEffect(() => {
    loadQuestions();
  }, [examId, isRevision, subjectFilter]);

  const loadQuestions = async () => {
    setLoading(true);

    if (isRevision && user) {
      // Revision mode: get question_ids from mistakes table, then fetch those questions
      let mistakeQuery = supabase
        .from("mistakes")
        .select("question_id")
        .eq("user_id", user.id) as any;

      if (revisionSubject) {
        mistakeQuery = mistakeQuery.eq("subject", revisionSubject);
      }

      const { data: mistakeData } = await mistakeQuery;
      const questionIds = mistakeData?.map((m) => m.question_id) || [];

      if (questionIds.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("questions")
        .select("*")
        .in("id", questionIds);

      if (data) {
        const qs: Question[] = (data as any[]).map((q: any) => ({
          id: String(q.id),
          text: q.question_text,
          options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string),
          correctIndex: q.options.indexOf(q.correct_answer),
          subject: q.subject || q.category || "",
        }));
        setQuestions(qs);
        setAnswers(qs.map(() => ({ selected: null, marked: false })));
        setTimeLeft(Math.max(qs.length * 60, 5 * 60));
      }
    } else {
      // Normal exam: load by test_id, optionally filter by category for subject sets
      const testId = examId || "1";

      // Fetch test metadata for duration and title
      const { data: testMeta } = await supabase
        .from("tests")
        .select("title, duration_minutes")
        .eq("id", testId as any)
        .single();

      if (testMeta) {
        const dur = ((testMeta as any).duration_minutes || 60) * 60;
        setExamDuration(dur);
        setTimeLeft(dur);
        setTestTitle((testMeta as any).title || "পরীক্ষা");
      }

      let query = supabase
        .from("questions")
        .select("*")
        .eq("test_id", testId as any);

      // If subject filter is present, filter by category (with variants)
      if (subjectFilter) {
        const variants = subjectVariantsMap[subjectFilter] || [subjectFilter];
        query = query.in("category", variants as any);
      }

      const { data } = await query;

      if (data && data.length > 0) {
        const qs: Question[] = (data as any[]).map((q: any) => ({
          id: String(q.id),
          text: q.question_text,
          options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string),
          correctIndex: q.options.indexOf(q.correct_answer),
          subject: q.subject || q.category || "",
        }));
        setQuestions(qs);
        setAnswers(qs.map(() => ({ selected: null, marked: false })));
        if (isSubjectMode) {
          // For subject sets: 1 min per question, min 5 min
          const dur = Math.max(qs.length * 60, 5 * 60);
          setExamDuration(dur);
          setTimeLeft(dur);
          setTestTitle(`${subjectFilter} — মিনি টেস্ট`);
        }
      }
    }
    setLoading(false);
  };

  const total = questions.length;
  const current = questions[currentIdx];
  const answer = answers[currentIdx];

  // Timer
  useEffect(() => {
    if (submitted || loading || total === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, loading, total]);

  const selectOption = (optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], selected: optIdx };
      return next;
    });
  };

  const toggleMark = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], marked: !next[currentIdx].marked };
      return next;
    });
  };

  const goTo = useCallback(
    (idx: number) => {
      setDir(idx > currentIdx ? 1 : -1);
      setCurrentIdx(idx);
      setShowNav(false);
    },
    [currentIdx]
  );

  const goNext = () => { if (currentIdx < total - 1) { setDir(1); setCurrentIdx((i) => i + 1); } };
  const goPrev = () => { if (currentIdx > 0) { setDir(-1); setCurrentIdx((i) => i - 1); } };

  const handleSubmit = async () => {
    setSubmitted(true);
    const timeTaken = (isRevision ? Math.max(total * 60, 5 * 60) : examDuration) - timeLeft;

    if (user) {
      // Save mistakes (wrong answers) to DB
      const mistakeInserts: any[] = [];
      const correctQuestionIds: string[] = [];
      let correctCount = 0;
      let wrongCount = 0;
      const subjectScores: Record<string, { correct: number; total: number }> = {};

      questions.forEach((q, i) => {
        const a = answers[i];
        if (!subjectScores[q.subject]) subjectScores[q.subject] = { correct: 0, total: 0 };
        subjectScores[q.subject].total++;

        if (a.selected !== null) {
          if (a.selected === q.correctIndex) {
            correctCount++;
            subjectScores[q.subject].correct++;
            if (isRevision) correctQuestionIds.push(q.id);
          } else {
            wrongCount++;
            if (!isRevision) {
              mistakeInserts.push({
                user_id: user.id,
                question_id: Number(q.id),
                test_id: Number(examId) || 1,
                subject: q.subject,
                question_text: q.text,
                correct_answer: q.options[q.correctIndex],
                user_answer: q.options[a.selected],
              });
            }
          }
        }
      });

      // Insert new mistakes
      if (mistakeInserts.length > 0) {
        await supabase.from("mistakes").insert(mistakeInserts as any);
      }

      // Delete corrected mistakes in revision mode
      if (isRevision && correctQuestionIds.length > 0) {
        await supabase
          .from("mistakes")
          .delete()
          .eq("user_id", user.id)
          .in("question_id", correctQuestionIds.map(Number));
      }

      // Save result (non-revision only)
      if (!isRevision) {
        const totalScore = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        await supabase.from("results").insert({
          user_id: user.id,
          test_id: Number(examId) || 1,
          correct_count: correctCount,
          wrong_count: wrongCount,
          total_score: totalScore,
          time_taken: Math.round(timeTaken),
          subject_scores: subjectScores,
        } as any);
      }

      // Update daily activity
      const today = new Date().toISOString().split("T")[0];
      const minutesSpent = Math.round(timeTaken / 60);
      const { data: existing } = await supabase
        .from("daily_activity" as any)
        .select("id, minutes_spent, tests_completed")
        .eq("user_id", user.id)
        .eq("activity_date", today)
        .single();

      if (existing) {
        await supabase
          .from("daily_activity" as any)
          .update({
            minutes_spent: (existing as any).minutes_spent + minutesSpent,
            tests_completed: (existing as any).tests_completed + 1,
          } as any)
          .eq("id", (existing as any).id);
      } else {
        await supabase.from("daily_activity" as any).insert({
          user_id: user.id,
          activity_date: today,
          minutes_spent: minutesSpent,
          tests_completed: 1,
        } as any);
      }

      // Update streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_activity_date, current_streak")
        .eq("id", user.id)
        .single();

      if (profile) {
        const lastDate = profile.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = 1;
        if (lastDate === today) {
          newStreak = profile.current_streak || 1;
        } else if (lastDate === yesterdayStr) {
          newStreak = (profile.current_streak || 0) + 1;
        }

        await supabase
          .from("profiles")
          .update({
            current_streak: newStreak,
            last_activity_date: today,
          } as any)
          .eq("id", user.id);
      }
    }

    // Navigate to results
    const questionResults = questions.map((q, i) => ({
      ...q,
      selected: answers[i].selected,
    }));
    navigate("/exam-result", {
      state: {
        testName: isRevision ? "রিভিশন পরীক্ষা" : isSubjectMode ? `${subjectFilter} — মিনি টেস্ট` : testTitle,
        questions: questionResults,
        timeTaken,
        totalTime: isRevision ? Math.max(total * 60, 5 * 60) : examDuration,
        isRevision,
        testId: isRevision ? null : (Number(examId) || 1),
      },
    });
  };

  // Stats
  const stats = useMemo(() => {
    const answered = answers.filter((a) => a.selected !== null).length;
    const marked = answers.filter((a) => a.marked).length;
    const unanswered = total - answered;
    let correct = 0;
    answers.forEach((a, i) => {
      if (a.selected === questions[i]?.correctIndex) correct++;
    });
    return { answered, marked, unanswered, correct };
  }, [answers, questions, total]);

  const progressPercent = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;
  const timeWarning = timeLeft < 120;
  const timeCritical = timeLeft < 30;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">প্রশ্ন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // No questions
  if (total === 0) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-xs mx-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isRevision ? "সব ভুল সংশোধন হয়েছে! 🎉" : "কোনো প্রশ্ন পাওয়া যায়নি"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRevision
              ? "ভুল উত্তরের খাতা খালি — দারুণ!"
              : "এই পরীক্ষায় এখনো প্রশ্ন যোগ হয়নি।"}
          </p>
            <Button onClick={() => navigate("/dashboard")} className="min-h-[44px]">
            ড্যাশবোর্ডে ফিরুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col">
      {/* ── Top Bar ── */}
      <header className="shrink-0 border-b bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            onClick={() => setShowExit(true)}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Revision badge + Timer */}
          <div className="flex items-center gap-2">
            {isRevision && (
              <span className="text-[10px] font-semibold bg-destructive/15 text-destructive rounded-full px-2 py-0.5">
                রিভিশন
              </span>
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-mono font-bold transition-colors",
                timeCritical
                  ? "bg-destructive/15 text-destructive animate-pulse"
                  : timeWarning
                    ? "bg-accent/15 text-accent-foreground"
                    : "bg-muted text-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <button
            onClick={() => setShowNav(true)}
            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
          >
            <Grid3X3 className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <Progress value={progressPercent} className="h-1 rounded-none" />
      </header>

      {/* ── Question Area ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={currentIdx}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  প্রশ্ন {currentIdx + 1}/{total}
                </span>
                <button
                  onClick={toggleMark}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                    answer?.marked
                      ? "bg-accent/20 text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Flag className={cn("h-3.5 w-3.5", answer?.marked && "fill-accent text-accent")} />
                  {answer?.marked ? "চিহ্নিত" : "পরে দেখব"}
                </button>
              </div>

              <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary mb-3">
                {current.subject}
              </span>

              <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed mb-6">
                {current.text}
              </h2>

              <div className="space-y-3">
                {current.options.map((opt, optIdx) => {
                  const isSelected = answer?.selected === optIdx;
                  return (
                    <motion.button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/8 shadow-sm"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {optionLabels[optIdx]}
                      </span>
                      <span className={cn(
                        "text-sm md:text-base leading-relaxed pt-1 font-medium",
                        isSelected ? "text-foreground" : "text-foreground/80"
                      )}>
                        {opt}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto shrink-0 pt-1"
                        >
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Bottom Navigation ── */}
      <footer className="shrink-0 border-t bg-card/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <Button variant="ghost" onClick={goPrev} disabled={currentIdx === 0} className="min-h-[48px] gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            পেছনে
          </Button>
          {currentIdx === total - 1 ? (
            <Button onClick={handleSubmit} className="min-h-[48px] px-6 bg-primary text-primary-foreground font-semibold gap-1.5">
              <CheckCircle className="h-4 w-4" />
              জমা দিন
            </Button>
          ) : (
            <Button onClick={goNext} className="min-h-[48px] px-6 gap-1.5">
              পরবর্তী
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>

      {/* ── Question Navigation Grid ── */}
      <Dialog open={showNav} onOpenChange={setShowNav}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogTitle className="text-base font-semibold">প্রশ্ন নেভিগেশন</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mb-2">
            যেকোনো প্রশ্নে সরাসরি যান
          </DialogDescription>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary" /> উত্তর দিয়েছেন</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-accent/50" /> চিহ্নিত</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted border border-border" /> বাকি</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const a = answers[i];
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex items-center justify-center h-11 w-full rounded-lg text-sm font-bold transition-all",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    a?.marked
                      ? "bg-accent/20 text-accent-foreground"
                      : a?.selected !== null
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
            <span>উত্তর: {stats.answered}/{total}</span>
            <span>চিহ্নিত: {stats.marked}</span>
          </div>
          <Button
            className="w-full mt-2 min-h-[44px] font-semibold"
            onClick={() => { setShowNav(false); handleSubmit(); }}
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            পরীক্ষা জমা দিন
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Exit Confirmation ── */}
      <Dialog open={showExit} onOpenChange={setShowExit}>
        <DialogContent className="sm:max-w-[340px] text-center">
          <DialogTitle className="sr-only">পরীক্ষা থেকে বের হন</DialogTitle>
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground">পরীক্ষা ছেড়ে দিতে চান?</h2>
            <p className="text-sm text-muted-foreground">
              আপনার অগ্রগতি হারিয়ে যাবে। {stats.answered}/{total}টি প্রশ্নের উত্তর দিয়েছেন।
            </p>
            <div className="flex gap-3 w-full mt-2">
              <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setShowExit(false)}>
                থাকব
              </Button>
              <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => navigate(isRevision ? "/error-bank" : "/")}>
                বের হব
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
