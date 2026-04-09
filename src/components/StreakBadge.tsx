import { Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StreakBadgeProps {
  count: number;
  className?: string;
}

const milestones = [7, 14, 30, 60, 100];

function getMilestoneEmoji(count: number) {
  if (count >= 100) return "🏆";
  if (count >= 60) return "💎";
  if (count >= 30) return "🔥";
  if (count >= 14) return "⭐";
  if (count >= 7) return "🎯";
  return null;
}

export function StreakBadge({ count, className }: StreakBadgeProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const isMilestone = milestones.includes(count);
  const emoji = getMilestoneEmoji(count);

  useEffect(() => {
    if (isMilestone && count > 0) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [count, isMilestone]);

  return (
    <div className="relative">
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent-foreground",
          isMilestone && "ring-2 ring-accent/40 animate-pulse",
          className
        )}
      >
        <Flame className="h-4 w-4 text-accent pulse-glow" />
        <span>{count} দিন স্ট্রিক</span>
        {emoji && <span className="text-sm">{emoji}</span>}
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
          >
            <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap shadow-lg">
              🎉 {count} দিনের মাইলস্টোন!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
