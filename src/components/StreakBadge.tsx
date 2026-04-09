import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  count: number;
  className?: string;
}

export function StreakBadge({ count, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent-foreground",
        className
      )}
    >
      <Flame className="h-4 w-4 text-accent pulse-glow" />
      <span>{count} দিন স্ট্রিক</span>
    </div>
  );
}
