import { useState } from "react";
import { Trophy, Medal, MapPin, Building } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const leaderboardData = [
  { rank: 1, name: "রাহুল আহমেদ", score: 9850, exams: 52, district: "ঢাকা" },
  { rank: 2, name: "ফাতেমা খানম", score: 9720, exams: 48, district: "রাজশাহী" },
  { rank: 3, name: "সাকিব হাসান", score: 9680, exams: 50, district: "চট্টগ্রাম" },
  { rank: 4, name: "নুসরাত জাহান", score: 9540, exams: 45, district: "ঢাকা" },
  { rank: 5, name: "মাহবুব আলম", score: 9320, exams: 47, district: "সিলেট" },
  { rank: 6, name: "তানিয়া ইসলাম", score: 9100, exams: 44, district: "খুলনা" },
  { rank: 7, name: "কামরুল হক", score: 8950, exams: 42, district: "রাজশাহী" },
  { rank: 8, name: "সুমাইয়া আক্তার", score: 8800, exams: 40, district: "বরিশাল" },
  { rank: 9, name: "জাহিদ করিম", score: 8650, exams: 38, district: "ময়মনসিংহ" },
  { rank: 10, name: "আয়েশা সিদ্দিকা", score: 8500, exams: 36, district: "রংপুর" },
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

type FilterType = "all" | "district" | "institution";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Leaderboard() {
  const [period, setPeriod] = useState("weekly");
  const [filter, setFilter] = useState<FilterType>("all");
  const { user } = useAuth();
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <motion.div
      className="container max-w-2xl py-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="mb-1 text-2xl font-bold">লিডারবোর্ড</h1>
        <p className="text-sm text-muted-foreground">শীর্ষ প্রতিযোগীদের তালিকা</p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">সাপ্তাহিক</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">মাসিক</TabsTrigger>
            <TabsTrigger value="alltime" className="flex-1">সর্বকালীন</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={item} className="flex gap-2">
        {[
          { value: "all" as const, label: "সবাই", icon: Trophy },
          { value: "district" as const, label: "জেলাভিত্তিক", icon: MapPin },
          { value: "institution" as const, label: "প্রতিষ্ঠান", icon: Building },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <f.icon className="h-3.5 w-3.5" />
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* District rank banner */}
      {filter === "district" && user && (
        <motion.div variants={item}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">রাজশাহী জেলায় তোমার অবস্থান</p>
                <p className="text-2xl font-bold text-primary">১০ম</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[top3[1], top3[0], top3[2]].map((u) => (
          <Card
            key={u.rank}
            className={cn(
              "card-shadow text-center",
              podiumBg[u.rank],
              u.rank === 1 && "-mt-4"
            )}
          >
            <CardContent className="flex flex-col items-center p-4">
              <Medal className={cn("mb-2 h-6 w-6", medalColors[u.rank])} />
              <Avatar className="mb-2 h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {u.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs font-semibold leading-tight">{u.name}</p>
              <p className="text-[10px] text-muted-foreground">{u.district}</p>
              <p className="mt-1 text-lg font-bold text-primary">{u.score}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {rest.map((u) => (
          <motion.div key={u.rank} variants={item}>
            <Card className="card-shadow">
              <CardContent className="flex items-center gap-3 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {u.rank}
                </span>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.district} · {u.exams} পরীক্ষা</p>
                </div>
                <span className="text-sm font-bold text-primary">{u.score}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Your rank */}
      {user && (
        <motion.div variants={item}>
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
        </motion.div>
      )}
    </motion.div>
  );
}
