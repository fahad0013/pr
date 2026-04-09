import { motion, AnimatePresence } from "framer-motion";

interface StreakLevelUpProps {
  show: boolean;
  count: number;
  onDone: () => void;
}

export function StreakLevelUp({ show, count, onDone }: StreakLevelUpProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDone}
        >
          <motion.div
            className="flex flex-col items-center gap-3 text-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            <motion.span
              className="text-7xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              🔥
            </motion.span>
            <motion.p
              className="text-3xl font-bold text-primary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {count} দিনের স্ট্রিক!
            </motion.p>
            <motion.p
              className="text-muted-foreground"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              চালিয়ে যাও! তুমি দারুণ করছো 💪
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
