import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";

interface SubjectInfo {
  subject: string;
  icon: string;
  setCount: number;
  questionCount: number;
}

const subjectMeta: Record<string, string> = {
  "Bangla": "📚",
  "English": "🔤",
  "Math": "🔢",
  "GK": "🌍",
  "বাংলা": "📚",
  "ইংরেজি": "🔤",
  "গণিত": "🔢",
  "সাধারণ জ্ঞান": "🌍",
};

const subjectDisplayName: Record<string, string> = {
  "Bangla": "বাংলা",
  "English": "ইংরেজি",
  "Math": "গণিত",
  "GK": "সাধারণ জ্ঞান",
};

const comingSoonExams = [
  { name: "BCS প্রিলিমিনারি", icon: "🏛️" },
  { name: "ব্যাংক নিয়োগ", icon: "🏦" },
  { name: "রেলওয়ে নিয়োগ", icon: "🚆" },
  { name: "পুলিশ নিয়োগ", icon: "👮" },
];

export default function Subjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    setLoading(true);

    // Fetch subject-type tests grouped by subject_category
    const { data: tests } = await (supabase
      .from("tests")
      .select("id, subject_category") as any)
      .eq("test_type", "subject");

    if (!tests || tests.length === 0) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    // Count questions per test
    const testIds = tests.map((t: any) => t.id);
    const { data: questions } = await supabase
      .from("questions")
      .select("test_id")
      .in("test_id", testIds);

    const qCountByTest: Record<number, number> = {};
    questions?.forEach((q: any) => {
      qCountByTest[q.test_id] = (qCountByTest[q.test_id] || 0) + 1;
    });

    // Group by subject_category
    const grouped: Record<string, { setCount: number; questionCount: number }> = {};
    tests.forEach((t: any) => {
      const cat = t.subject_category || "Unknown";
      if (!grouped[cat]) grouped[cat] = { setCount: 0, questionCount: 0 };
      grouped[cat].setCount += 1;
      grouped[cat].questionCount += qCountByTest[t.id] || 0;
    });

    const subjectList: SubjectInfo[] = Object.entries(grouped).map(([subject, info]) => ({
      subject,
      icon: subjectMeta[subject] || "📝",
      setCount: info.setCount,
      questionCount: info.questionCount,
    }));

    // Sort consistently
    const order = ["Bangla", "English", "Math", "GK", "বাংলা", "ইংরেজি", "গণিত", "সাধারণ জ্ঞান"];
    subjectList.sort((a, b) => {
      const ai = order.indexOf(a.subject);
      const bi = order.indexOf(b.subject);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

    setSubjects(subjectList);
    setLoading(false);
  };

  const handleStartExam = (subject: string) => {
    navigate(`/dashboard/subjects/${encodeURIComponent(subject)}`);
  };

  const getDisplayName = (subject: string) => subjectDisplayName[subject] || subject;

  return (
    <div className="container max-w-2xl py-6 animate-fade-in space-y-8">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
      />

      <div>
        <h1 className="mb-1 text-2xl font-bold">প্রাথমিক শিক্ষক নিয়োগ</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          বিষয়ভিত্তিক সেট বেছে নিন — প্রতিটি সেটে ২০টি প্রশ্ন ও ২০ নম্বর
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">কোনো বিষয়ভিত্তিক সেট পাওয়া যায়নি</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {subjects.map((sub) => (
              <Card
                key={sub.subject}
                className="card-shadow hover-scale cursor-pointer transition-shadow"
                onClick={() => handleStartExam(sub.subject)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold leading-tight">{getDisplayName(sub.subject)}</h3>
                      <p className="text-xs text-muted-foreground">
                        {sub.setCount}টি সেট • {sub.questionCount}টি প্রশ্ন
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {sub.setCount} সেট
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full gap-1.5 min-h-[40px]"
                    onClick={(e) => { e.stopPropagation(); handleStartExam(sub.subject); }}
                  >
                    পরীক্ষা দিন
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">শীঘ্রই আসছে</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {comingSoonExams.map((exam) => (
            <Card key={exam.name} className="opacity-50 cursor-not-allowed">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl">{exam.icon}</span>
                <span className="flex-1 text-sm font-medium">{exam.name}</span>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  শীঘ্রই
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
