import { ClipboardCheck, BarChart3, Medal, ArrowRight, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StreakBadge } from "@/components/StreakBadge";
import { ProgressRing } from "@/components/ProgressRing";
import { StatCard } from "@/components/StatCard";
import { SubjectCard } from "@/components/SubjectCard";

const stats = [
  { icon: ClipboardCheck, label: "পরীক্ষা দিয়েছেন", value: 47 },
  { icon: BarChart3, label: "গড় স্কোর", value: "৭২%" },
  { icon: Medal, label: "র‍্যাংক", value: "#১২৩" },
];

const continueSubjects = [
  { name: "বাংলা ভাষা ও সাহিত্য", icon: "📚", topicCount: 45, completionPercent: 68 },
  { name: "English Language", icon: "🔤", topicCount: 38, completionPercent: 42 },
  { name: "গণিত", icon: "🔢", topicCount: 52, completionPercent: 35 },
];

export default function Index() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Hero */}
      <section className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
        <StreakBadge count={12} className="mb-4" />
        <h1 className="mb-2 text-2xl font-bold leading-tight md:text-3xl">
          আজকে কি প্রস্তুত? 💪
        </h1>
        <p className="mb-5 text-sm opacity-80">
          প্রতিদিন একটু একটু করে এগিয়ে যান — সাফল্য আসবেই!
        </p>
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[48px] text-base"
        >
          অনুশীলন শুরু করুন
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Daily Progress */}
      <section className="flex items-center gap-5">
        <ProgressRing progress={65} size={90} strokeWidth={7}>
          <div className="text-center">
            <span className="text-lg font-bold">৬৫%</span>
          </div>
        </ProgressRing>
        <div>
          <h2 className="font-semibold">আজকের লক্ষ্য</h2>
          <p className="text-sm text-muted-foreground">১৩/২০ প্রশ্নের উত্তর দিয়েছেন</p>
          <p className="mt-1 text-xs text-primary font-medium">আরও ৭টি বাকি — চালিয়ে যান!</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      {/* Live Exam Banner */}
      <Link to="/live-exam">
        <Card className="border-accent/50 bg-accent/5 card-shadow hover-scale cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <Radio className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-accent">লাইভ পরীক্ষা চলছে</p>
              <p className="font-semibold">BCS প্রিলি মক টেস্ট — ০৭</p>
              <p className="text-xs text-muted-foreground">২৩৪ জন অংশগ্রহণ করছে</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {/* Continue Studying */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">চালিয়ে যান</h2>
          <Link to="/subjects" className="text-sm font-medium text-primary hover:underline">
            সব দেখুন
          </Link>
        </div>
        <div className="space-y-3">
          {continueSubjects.map((sub) => (
            <SubjectCard key={sub.name} {...sub} />
          ))}
        </div>
      </section>
    </div>
  );
}
