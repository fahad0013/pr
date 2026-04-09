import { SubjectCard } from "@/components/SubjectCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

const primarySubjects = [
  { name: "বাংলা ভাষা ও সাহিত্য", icon: "📚", topicCount: 20, completionPercent: 0 },
  { name: "English Language", icon: "🔤", topicCount: 20, completionPercent: 0 },
  { name: "গণিত", icon: "🔢", topicCount: 20, completionPercent: 0 },
  { name: "সাধারণ জ্ঞান", icon: "🌍", topicCount: 20, completionPercent: 0 },
];

const comingSoonExams = [
  { name: "BCS প্রিলিমিনারি", icon: "🏛️" },
  { name: "ব্যাংক নিয়োগ", icon: "🏦" },
  { name: "রেলওয়ে নিয়োগ", icon: "🚆" },
  { name: "পুলিশ নিয়োগ", icon: "👮" },
];

export default function Subjects() {
  return (
    <div className="container max-w-2xl py-6 animate-fade-in space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-bold">প্রাথমিক শিক্ষক নিয়োগ</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          প্রাথমিক সহকারী শিক্ষক নিয়োগ পরীক্ষার বিষয়সমূহ
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {primarySubjects.map((sub) => (
            <SubjectCard key={sub.name} {...sub} />
          ))}
        </div>
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
