import { motion } from "framer-motion";
import type { Badge, BadgeType } from "@/hooks/useBadges";
import { cn } from "@/lib/utils";

const badgeMeta: Record<BadgeType, { emoji: string; label: string; gradient: string; shadow: string }> = {
  bronze: {
    emoji: "🥉",
    label: "ব্রোঞ্জ",
    gradient: "from-amber-700/20 to-amber-500/10 border-amber-600/30",
    shadow: "shadow-amber-700/20",
  },
  silver: {
    emoji: "🥈",
    label: "সিলভার",
    gradient: "from-gray-400/20 to-gray-200/10 border-gray-400/30",
    shadow: "shadow-gray-400/20",
  },
  gold: {
    emoji: "🥇",
    label: "গোল্ড",
    gradient: "from-yellow-500/20 to-amber-300/10 border-yellow-500/30",
    shadow: "shadow-yellow-500/20",
  },
};

const allBadgeTypes: BadgeType[] = ["bronze", "silver", "gold"];

interface BadgeDisplayProps {
  badges: Badge[];
  className?: string;
}

export function BadgeDisplay({ badges, className }: BadgeDisplayProps) {
  const earnedTypes = new Set(badges.map((b) => b.badge_type));

  return (
    <div className={cn("flex items-center gap-3 justify-center", className)}>
      {allBadgeTypes.map((type) => {
        const meta = badgeMeta[type];
        const earned = earnedTypes.has(type);
        return (
          <motion.div
            key={type}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl border p-3 bg-gradient-to-b transition-all",
              earned ? meta.gradient : "from-muted/30 to-muted/10 border-border/30",
              earned && `shadow-lg ${meta.shadow}`
            )}
            whileHover={earned ? { scale: 1.1, rotateY: 15 } : {}}
            style={{ perspective: 400 }}
          >
            <span className={cn("text-3xl", !earned && "grayscale opacity-30")}>
              {meta.emoji}
            </span>
            <span className={cn("text-[10px] font-semibold", earned ? "text-foreground" : "text-muted-foreground/50")}>
              {meta.label}
            </span>
            {earned && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Small inline badge icon for leaderboard
export function BadgeIcon({ type }: { type: BadgeType | null }) {
  if (!type || type !== "gold") return null;
  return (
    <motion.span
      className="inline-flex ml-1"
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      title="গোল্ড ব্যাজ ধারী"
    >
      🥇
    </motion.span>
  );
}
