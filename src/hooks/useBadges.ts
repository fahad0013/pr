import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BadgeType = "bronze" | "silver" | "gold";

export interface Badge {
  badge_type: BadgeType;
  earned_at: string;
}

export function useBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<BadgeType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("badges" as any)
      .select("badge_type, earned_at")
      .eq("user_id", user.id);
    setBadges((data as any[] || []) as Badge[]);
    setLoading(false);
  }, [user]);

  const checkAndAward = useCallback(async () => {
    if (!user) return;

    // Fetch current data
    const [profileRes, resultsRes, badgesRes] = await Promise.all([
      supabase.from("profiles").select("current_streak").eq("id", user.id).single(),
      supabase.from("results").select("total_score").eq("user_id", user.id),
      supabase.from("badges" as any).select("badge_type").eq("user_id", user.id),
    ]);

    const streak = profileRes.data?.current_streak || 0;
    const results = (resultsRes.data || []) as any[];
    const existingBadges = new Set(((badgesRes.data || []) as any[]).map((b: any) => b.badge_type));

    const highScoreCount50 = results.filter((r: any) => Number(r.total_score) >= 50).length;
    const highScoreCount70 = results.filter((r: any) => Number(r.total_score) >= 70).length;

    // Check Gold first (highest priority for celebration)
    if (!existingBadges.has("gold") && (streak >= 30 || highScoreCount70 >= 10)) {
      const { error } = await supabase.rpc("award_badge", { p_user_id: user.id, p_badge_type: "gold" });
      if (!error) { setNewBadge("gold"); await fetchBadges(); }
      return;
    }

    if (!existingBadges.has("silver") && (streak >= 10 || highScoreCount50 >= 5)) {
      const { error } = await supabase.rpc("award_badge", { p_user_id: user.id, p_badge_type: "silver" });
      if (!error) { setNewBadge("silver"); await fetchBadges(); }
      return;
    }

    if (!existingBadges.has("bronze") && streak >= 3) {
      const { error } = await supabase.rpc("award_badge", { p_user_id: user.id, p_badge_type: "bronze" });
      if (!error) { setNewBadge("bronze"); await fetchBadges(); }
      return;
    }
  }, [user, fetchBadges]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const dismissCelebration = () => setNewBadge(null);

  const hasBadge = (type: BadgeType) => badges.some((b) => b.badge_type === type);
  const highestBadge = hasBadge("gold") ? "gold" : hasBadge("silver") ? "silver" : hasBadge("bronze") ? "bronze" : null;

  return { badges, loading, newBadge, dismissCelebration, checkAndAward, hasBadge, highestBadge };
}

// Utility to get badge info by user IDs (for leaderboard)
export async function fetchUserBadges(userIds: string[]): Promise<Record<string, BadgeType | null>> {
  if (userIds.length === 0) return {};
  const { data } = await supabase
    .from("badges" as any)
    .select("user_id, badge_type")
    .in("user_id", userIds);

  const map: Record<string, BadgeType | null> = {};
  userIds.forEach((id) => (map[id] = null));
  ((data || []) as any[]).forEach((b: any) => {
    const current = map[b.user_id];
    const rank = { bronze: 1, silver: 2, gold: 3 } as Record<string, number>;
    if (!current || rank[b.badge_type] > rank[current]) {
      map[b.user_id] = b.badge_type as BadgeType;
    }
  });
  return map;
}
