import { motion, AnimatePresence } from "framer-motion";
import type { BadgeType } from "@/hooks/useBadges";

const badgeConfig: Record<string, { emoji: string; name: string; gradient: string }> = {
  bronze: { emoji: "🥉", name: "ব্রোঞ্জ ব্যাজ", gradient: "from-amber-700 to-amber-500" },
  silver: { emoji: "🥈", name: "সিলভার ব্যাজ", gradient: "from-gray-400 to-gray-200" },
  gold: { emoji: "🥇", name: "গোল্ড ব্যাজ", gradient: "from-yellow-500 to-amber-300" },
};

interface BadgeCelebrationProps {
  badge: BadgeType | null;
  onDismiss: () => void;
}

export function BadgeCelebration({ badge, onDismiss }: BadgeCelebrationProps) {
  if (!badge) return null;
  const config = badgeConfig[badge];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
      >
        {/* Confetti-like particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--accent))" : "hsl(var(--secondary))",
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              y: [0, -100 - Math.random() * 200],
              x: [(Math.random() - 0.5) * 100],
            }}
            transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, repeat: Infinity, repeatDelay: Math.random() * 2 }}
          />
        ))}

        <motion.div
          className="flex flex-col items-center gap-4 text-center z-10 px-6"
          initial={{ scale: 0.3, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 150 }}
        >
          {/* 3D Medal */}
          <motion.div
            className={`relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} shadow-2xl`}
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ perspective: 600, transformStyle: "preserve-3d" }}
          >
            <span className="text-6xl drop-shadow-lg">{config.emoji}</span>
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
          </motion.div>

          <motion.p
            className="text-2xl md:text-3xl font-bold text-primary"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            চমৎকার!
          </motion.p>
          <motion.p
            className="text-lg text-foreground font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            আপনি <span className="text-primary font-bold">{config.name}</span> অর্জন করেছেন!
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            ট্যাপ করে বন্ধ করুন
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
