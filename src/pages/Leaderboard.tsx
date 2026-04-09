import { useState, useEffect } from "react";
import { Trophy, Medal, MapPin, Building, Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserBadges, type BadgeType } from "@/hooks/useBadges";
import { BadgeIcon } from "@/components/BadgeDisplay";

interface LeaderEntry {
  rank: number;
  name: string;
  score: number;
  district: string;
  institution: string;
  exams: number;
  userId: string;
}

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
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedTestId, setSelectedTestId] = useState<string>("all");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allEntries, setAllEntries] = useState<LeaderEntry[]>([]);
  const [myProfile, setMyProfile] = useState<{ district: string; institution: string } | null>(null);
  const [tests, setTests] = useState<{ id: number; title: string }[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [userBadges, setUserBadges] = useState<Record<string, BadgeType | null>>({});

  useEffect(() => {
    loadData();
  }, [user, selectedTestId]);

  const loadData = async () => {
    setLoading(true);

    // Load tests list & my profile in parallel
    const [testsRes, profileRes] = await Promise.all([
      supabase.from("tests").select("id, title"),
      user ? supabase.from("profiles").select("district, institution").eq("id", user.id).single() : null,
    ]);

    setTests((testsRes.data || []) as any[]);
    if (profileRes?.data) {
      setMyProfile({
        district: (profileRes.data as any).district || "",
        institution: (profileRes.data as any).institution || "",
      });
    }

    // Load results (optionally filtered by test)
    let query = supabase.from("results").select("user_id, total_score, test_id");
    if (selectedTestId !== "all") {
      query = query.eq("test_id", Number(selectedTestId) as any);
    }
    const { data: results } = await query;

    if (!results) {
      setLoading(false);
      return;
    }

    const userScores: Record<string, { score: number; exams: number }> = {};
    results.forEach((r: any) => {
      if (!r.user_id) return;
      if (!userScores[r.user_id]) userScores[r.user_id] = { score: 0, exams: 0 };
      userScores[r.user_id].score += Number(r.total_score || 0);
      userScores[r.user_id].exams += 1;
    });

    const sorted = Object.entries(userScores).sort(([, a], [, b]) => b.score - a.score);
    const userIds = sorted.map(([id]) => id);

    let profileMap: Record<string, { name: string; district: string; institution: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, district, institution")
        .in("id", userIds);
      profiles?.forEach((p: any) => {
        profileMap[p.id] = {
          name: p.display_name || "ব্যবহারকারী",
          district: p.district || "",
          institution: p.institution || "",
        };
      });
    }

    const list: LeaderEntry[] = sorted.map(([id, data], i) => ({
      rank: i + 1,
      name: profileMap[id]?.name || "ব্যবহারকারী",
      score: Math.round(data.score),
      district: profileMap[id]?.district || "",
      institution: profileMap[id]?.institution || "",
      exams: data.exams,
      userId: id,
    }));

    setAllEntries(list);

    // Fetch badges for all users
    const badgesMap = await fetchUserBadges(list.map((e) => e.userId));
    setUserBadges(badgesMap);

    if (user) {
      const myIdx = list.findIndex((e) => e.userId === user.id);
      if (myIdx >= 0) {
        setMyRank(myIdx + 1);
        setMyScore(list[myIdx].score);
      } else {
        setMyRank(null);
        setMyScore(0);
      }
    }

    setLoading(false);
  };

  // Apply filter
  const filteredEntries = allEntries.filter((e) => {
    if (filter === "district" && myProfile?.district) {
      return e.district === myProfile.district;
    }
    if (filter === "institution" && myProfile?.institution) {
      return e.institution === myProfile.institution;
    }
    return true;
  }).map((e, i) => ({ ...e, rank: i + 1 }));

  const myFilteredRank = user
    ? filteredEntries.findIndex((e) => e.userId === user.id) + 1 || null
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const top3 = filteredEntries.slice(0, 3);
  const rest = filteredEntries.slice(3, 20);
  const isMyRankVisible = myFilteredRank && myFilteredRank <= 20;

  return (
    <motion.div
      className="container max-w-2xl py-6 pb-24 space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <h1 className="mb-1 text-2xl font-bold">লিডারবোর্ড</h1>
        <p className="text-sm text-muted-foreground">শীর্ষ প্রতিযোগীদের তালিকা</p>
      </motion.div>

      {/* Test filter */}
      <motion.div variants={item}>
        <Select value={selectedTestId} onValueChange={setSelectedTestId}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="সব পরীক্ষা" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব পরীক্ষা</SelectItem>
            {tests.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Scope filter tabs */}
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

      {filter !== "all" && !myProfile?.district && filter === "district" && (
        <motion.div variants={item}>
          <Card className="card-shadow border-accent/30">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              জেলা ফিল্টার কাজ করতে প্রোফাইলে জেলা যোগ করুন
            </CardContent>
          </Card>
        </motion.div>
      )}

      {filter !== "all" && !myProfile?.institution && filter === "institution" && (
        <motion.div variants={item}>
          <Card className="card-shadow border-accent/30">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              প্রতিষ্ঠান ফিল্টার কাজ করতে প্রোফাইলে প্রতিষ্ঠান যোগ করুন
            </CardContent>
          </Card>
        </motion.div>
      )}

      {filteredEntries.length === 0 ? (
        <motion.div variants={item}>
          <Card className="card-shadow">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-primary/30" />
              <p className="text-sm">এখনো কোনো ডেটা নেই — প্রথম পরীক্ষা দিয়ে শীর্ষে উঠুন!</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <motion.div variants={item} className="grid grid-cols-3 gap-3">
              {[top3[1], top3[0], top3[2]].map((u) => (
                <Card
                  key={u.userId}
                  className={cn(
                    "card-shadow text-center",
                    podiumBg[u.rank],
                    u.rank === 1 && "-mt-4",
                    user && u.userId === user.id && "ring-2 ring-primary"
                  )}
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <Medal className={cn("mb-2 h-6 w-6", medalColors[u.rank])} />
                    <Avatar className="mb-2 h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {u.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-semibold leading-tight">{u.name}<BadgeIcon type={userBadges[u.userId]} /></p>
                    {u.district && <p className="text-[10px] text-muted-foreground">{u.district}</p>}
                    <p className="mt-1 text-lg font-bold text-primary">{u.score}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {rest.map((u) => (
              <motion.div key={u.userId} variants={item}>
                <Card className={cn(
                  "card-shadow",
                  user && u.userId === user.id && "border-primary/40 bg-primary/5"
                )}>
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
                      <p className="text-sm font-semibold leading-tight">
                        {u.name} {user && u.userId === user.id && "(আপনি)"}
                        <BadgeIcon type={userBadges[u.userId]} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.district ? `${u.district} · ` : ""}{u.exams} পরীক্ষা
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{u.score}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Your rank (if not in top 20) */}
          {myFilteredRank && !isMyRankVisible && (
            <motion.div variants={item}>
              <Card className="border-primary/30 card-shadow">
                <CardContent className="flex items-center gap-3 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {myFilteredRank}
                  </span>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      আ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">আপনি</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{myScore.toLocaleString()}</span>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
