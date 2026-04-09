import { useState } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const leaderboardData = [
  { rank: 1, name: "রাহুল আহমেদ", score: 9850, exams: 52 },
  { rank: 2, name: "ফাতেমা খানম", score: 9720, exams: 48 },
  { rank: 3, name: "সাকিব হাসান", score: 9680, exams: 50 },
  { rank: 4, name: "নুসরাত জাহান", score: 9540, exams: 45 },
  { rank: 5, name: "মাহবুব আলম", score: 9320, exams: 47 },
  { rank: 6, name: "তানিয়া ইসলাম", score: 9100, exams: 44 },
  { rank: 7, name: "কামরুল হক", score: 8950, exams: 42 },
  { rank: 8, name: "সুমাইয়া আক্তার", score: 8800, exams: 40 },
  { rank: 9, name: "জাহিদ করিম", score: 8650, exams: 38 },
  { rank: 10, name: "আয়েশা সিদ্দিকা", score: 8500, exams: 36 },
];

const medalColors: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-700",
};

const podiumBg: Record<number, string> = {
  1: "bg-yellow-500/10 border-yellow-500/30",
  2: "bg-gray-400/10 border-gray-400/30",
  3: "bg-amber-700/10 border-amber-700/30",
};

export default function Leaderboard() {
  const [period, setPeriod] = useState("weekly");
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="mb-1 text-2xl font-bold">লিডারবোর্ড</h1>
        <p className="text-sm text-muted-foreground">শীর্ষ প্রতিযোগীদের তালিকা</p>
      </div>

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="w-full">
          <TabsTrigger value="weekly" className="flex-1">সাপ্তাহিক</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">মাসিক</TabsTrigger>
          <TabsTrigger value="alltime" className="flex-1">সর্বকালীন</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {[top3[1], top3[0], top3[2]].map((user) => (
          <Card
            key={user.rank}
            className={cn(
              "card-shadow text-center",
              podiumBg[user.rank],
              user.rank === 1 && "-mt-4"
            )}
          >
            <CardContent className="flex flex-col items-center p-4">
              <Medal className={cn("mb-2 h-6 w-6", medalColors[user.rank])} />
              <Avatar className="mb-2 h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="mt-1 text-lg font-bold text-primary">{user.score}</p>
              <p className="text-[10px] text-muted-foreground">{user.exams} পরীক্ষা</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((user) => (
          <Card key={user.rank} className="card-shadow">
            <CardContent className="flex items-center gap-3 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                {user.rank}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.exams} পরীক্ষা</p>
              </div>
              <span className="text-sm font-bold text-primary">{user.score}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Your rank */}
      <Card className="border-primary/30 card-shadow">
        <CardContent className="flex items-center gap-3 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            ১২৩
          </span>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              আ
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">আপনি</p>
            <p className="text-xs text-muted-foreground">৪৭ পরীক্ষা</p>
          </div>
          <span className="text-sm font-bold text-primary">৭,২৫০</span>
        </CardContent>
      </Card>
    </div>
  );
}
