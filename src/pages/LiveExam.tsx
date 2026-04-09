import { Radio, Users, Clock, ArrowRight, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { LoginPromptModal } from "@/components/LoginPromptModal";

const liveExams = [
  {
    id: "1",
    title: "প্রাথমিক শিক্ষক মক টেস্ট — ০১",
    status: "live" as const,
    participants: 234,
    duration: "১ ঘণ্টা ২০ মিনিট",
    questions: 80,
    endsIn: "১ ঘণ্টা ২৩ মিনিট",
  },
];

const upcomingExams = [
  {
    id: "primary-mock-02",
    title: "প্রাথমিক শিক্ষক মক টেস্ট — ০২",
    startsAt: "শীঘ্রই আসছে",
    participants: 156,
    duration: "১ ঘণ্টা ২০ মিনিট",
    questions: 80,
    locked: true,
  },
  {
    id: "bcs-prelim",
    title: "BCS প্রিলি মক টেস্ট — ০১",
    startsAt: "শীঘ্রই আসছে",
    participants: 312,
    duration: "২ ঘণ্টা",
    questions: 200,
    locked: true,
  },
  {
    id: "bank-recruit",
    title: "ব্যাংক রিক্রুটমেন্ট — মডেল টেস্ট",
    startsAt: "শীঘ্রই আসছে",
    participants: 78,
    duration: "১ ঘণ্টা",
    questions: 100,
    locked: true,
  },
];

export default function LiveExam() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  const handleJoin = (examId: string) => {
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      <LoginPromptModal
        open={loginPrompt}
        onOpenChange={setLoginPrompt}
        onLogin={() => { setLoginPrompt(false); setAuthOpen(true); }}
      />

      <div>
        <h1 className="mb-1 text-2xl font-bold">লাইভ পরীক্ষা</h1>
        <p className="text-sm text-muted-foreground">রিয়েল-টাইমে পরীক্ষায় অংশ নিন</p>
      </div>

      {/* Live Now */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
          এখন চলছে
        </h2>
        <div className="space-y-3">
          {liveExams.map((exam) => (
            <Card key={exam.id} className="border-primary/30 card-shadow">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <Badge className="mb-2 bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <Radio className="mr-1 h-3 w-3" /> লাইভ
                    </Badge>
                    <h3 className="font-semibold">{exam.title}</h3>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {exam.participants} জন
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {exam.endsIn} বাকি
                  </span>
                  <span>{exam.questions} প্রশ্ন</span>
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
          ))}
        </div>
      </section>

      {/* Upcoming / Coming Soon */}
      <section>
        <h2 className="mb-3 text-base font-semibold">আসন্ন পরীক্ষা</h2>
        <div className="space-y-3">
          {upcomingExams.map((exam) => (
            <Card key={exam.id} className="card-shadow opacity-60 cursor-not-allowed">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exam.startsAt} · {exam.duration} · {exam.questions} প্রশ্ন
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3" /> {exam.participants} জন আগ্রহী
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  শীঘ্রই
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
