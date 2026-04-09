import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { bangladeshDistricts } from "@/data/districts";
import { CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingFlowProps {
  open: boolean;
  onComplete: () => void;
}

const subjectOptions = [
  { value: "bangla", label: "বাংলা", icon: "📚" },
  { value: "english", label: "ইংরেজি", icon: "🔤" },
  { value: "math", label: "গণিত", icon: "🔢" },
  { value: "gk", label: "সাধারণ জ্ঞান", icon: "🌍" },
  { value: "all", label: "সবগুলো", icon: "✨" },
];

const roleOptions = [
  { value: "ছাত্র", label: "ছাত্র", icon: "👨‍🎓" },
  { value: "ছাত্রী", label: "ছাত্রী", icon: "👩‍🎓" },
  { value: "চাকরিপ্রার্থী", label: "চাকরিপ্রার্থী", icon: "💼" },
];

const goalOptions = [
  { value: 15, label: "১৫ মিনিট", desc: "হালকা শুরু" },
  { value: 30, label: "৩০ মিনিট", desc: "নিয়মিত অনুশীলন" },
  { value: 60, label: "১ ঘণ্টা", desc: "সিরিয়াস প্রস্তুতি" },
  { value: 120, label: "২ ঘণ্টা", desc: "ম্যারাথন মোড 🔥" },
];

const TOTAL_STEPS = 6;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export function OnboardingFlow({ open, onComplete }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  );
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [district, setDistrict] = useState("");
  const [dailyGoal, setDailyGoal] = useState(30);

  const goNext = () => { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)); };
  const goBack = () => { setDir(-1); setStep((s) => Math.max(s - 1, 0)); };

  const canNext = () => {
    if (step === 0) return subjects.length > 0;
    if (step === 1) return displayName.trim().length > 0;
    if (step === 2) return role !== "";
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const selectedSubjects = subjects.includes("all")
      ? ["bangla", "english", "math", "gk"]
      : subjects;

    await (supabase.from("profiles") as any).update({
      display_name: displayName.trim(),
      subject_interest: selectedSubjects,
      role,
      institution: institution.trim() || null,
      district: district || null,
      daily_goal_minutes: dailyGoal,
      onboarding_completed: true,
    }).eq("id", user.id);

    setSaving(false);
    onComplete();
  };

  const toggleSubject = (val: string) => {
    if (val === "all") {
      setSubjects(subjects.includes("all") ? [] : ["all"]);
    } else {
      setSubjects((prev) =>
        prev.filter((s) => s !== "all").includes(val)
          ? prev.filter((s) => s !== val)
          : [...prev.filter((s) => s !== "all"), val]
      );
    }
  };

  const isLast = step === TOTAL_STEPS - 1;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">তুমি কোন বিষয়ে চর্চা করতে চাও? 📖</h2>
            <p className="text-sm text-muted-foreground">একটি বা একাধিক বিষয় বেছে নাও</p>
            <div className="grid grid-cols-2 gap-3">
              {subjectOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSubject(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    subjects.includes(opt.value)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">তোমার নাম কি? ✍️</h2>
            <p className="text-sm text-muted-foreground">অন্যরা তোমাকে এই নামেই চিনবে</p>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="তোমার পুরো নাম লেখো"
              className="text-base min-h-[48px]"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">তুমি একজন? 🎓</h2>
            <div className="grid gap-3">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    role === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">তোমার প্রতিষ্ঠান কোনটি? 🏫</h2>
            <p className="text-sm text-muted-foreground">ঐচ্ছিক — পরেও দিতে পারবে</p>
            <Input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="বিশ্ববিদ্যালয় / কলেজের নাম"
              className="text-base min-h-[48px]"
              autoFocus
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">তোমার জেলা কোনটি? 📍</h2>
            <p className="text-sm text-muted-foreground">জেলাভিত্তিক লিডারবোর্ডে দেখানো হবে</p>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="min-h-[48px] text-base">
                <SelectValue placeholder="জেলা বেছে নাও" />
              </SelectTrigger>
              <SelectContent className="max-h-[240px]">
                {bangladeshDistricts.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              প্রতিদিন কতক্ষণ প্র্যাকটিস করতে চাও? 🔥
            </h2>
            <p className="text-sm text-muted-foreground">এটা তোমার ডেইলি স্ট্রিক গোল হবে</p>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDailyGoal(opt.value)}
                  className={cn(
                    "flex flex-col rounded-xl border-2 p-4 text-left transition-all",
                    dailyGoal === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg font-bold text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border-border/50" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogTitle className="sr-only">অনবোর্ডিং</DialogTitle>

        {/* Progress bar */}
        <div className="flex gap-1.5 px-6 pt-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="relative px-6 py-6 min-h-[280px] flex items-start">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/30">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            পেছনে
          </Button>

          <span className="text-xs text-muted-foreground">{step + 1}/{TOTAL_STEPS}</span>

          {isLast ? (
            <Button onClick={handleFinish} disabled={saving} className="gap-1">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              শুরু করি!
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canNext()} className="gap-1">
              পরবর্তী
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
