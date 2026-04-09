import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
  Trophy,
  Users,
  CheckCircle,
  Flame,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Clock,
  Moon,
  Sun,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: BookOpen,
    title: "মক টেস্ট",
    titleEn: "Mock Tests",
    description:
      "BCS প্রিলি ও অন্যান্য পরীক্ষার মডেল টেস্ট দিন এবং নিজেকে যাচাই করুন।",
  },
  {
    icon: Target,
    title: "বিষয়ভিত্তিক অনুশীলন",
    titleEn: "Subject Practice",
    description:
      "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান — প্রতিটি বিষয় আলাদাভাবে প্র্যাকটিস করুন।",
  },
  {
    icon: BarChart3,
    title: "ভুল ট্র্যাকার",
    titleEn: "Mistake Tracker",
    description:
      "কোথায় ভুল হচ্ছে তা বিশ্লেষণ করুন এবং দুর্বলতা কাটিয়ে উঠুন।",
  },
  {
    icon: Trophy,
    title: "লিডারবোর্ড",
    titleEn: "Leaderboard",
    description:
      "হাজারো শিক্ষার্থীর সাথে প্রতিযোগিতা করুন এবং নিজের অবস্থান দেখুন।",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "দ্রুত প্রস্তুতি",
    description: "প্রতিটি টেস্ট শেষে তাৎক্ষণিক ফলাফল ও বিশ্লেষণ পান।",
  },
  {
    icon: Shield,
    title: "নির্ভুল প্রশ্নব্যাংক",
    description: "বিগত পরীক্ষার প্রশ্ন ও বিশেষজ্ঞ-প্রণীত MCQ।",
  },
  {
    icon: Clock,
    title: "সময় ব্যবস্থাপনা",
    description: "প্রকৃত পরীক্ষার মতো টাইমার ও প্রেশার সিমুলেশন।",
  },
  {
    icon: Star,
    title: "গ্যামিফিকেশন",
    description: "XP, স্ট্রিক, লেভেল আপ — প্রতিদিন অনুশীলনের অনুপ্রেরণা।",
  },
];

const testimonials = [
  {
    name: "রাফিদ আহমেদ",
    role: "প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার্থী",
    text: "প্রস্তুতি অ্যাপ ব্যবহার করে আমার সঠিকতা ৫৫% থেকে ৮২% এ উন্নীত হয়েছে!",
    avatar: "রা",
  },
  {
    name: "তাসনিম জাহান",
    role: "BCS পরীক্ষার্থী",
    text: "ভুল ট্র্যাকার ফিচারটি অসাধারণ — ঠিক কোথায় দুর্বল তা বুঝতে পারছি।",
    avatar: "তা",
  },
  {
    name: "সাকিব হাসান",
    role: "ব্যাংক নিয়োগ পরীক্ষার্থী",
    text: "লিডারবোর্ড দেখে প্রতিযোগিতামূলক মনোভাব তৈরি হয় — প্র্যাকটিস বাড়ে!",
    avatar: "সা",
  },
];

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<
    { rank: number; name: string; score: number }[]
  >([]);
  const [studentCount, setStudentCount] = useState(0);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Fetch real leaderboard preview
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, count } = await supabase
        .from("results")
        .select("user_id, total_score", { count: "exact" });

      // Aggregate scores per user
      if (data && data.length > 0) {
        const userScores: Record<string, number> = {};
        data.forEach((r) => {
          if (r.user_id && r.total_score) {
            userScores[r.user_id] =
              (userScores[r.user_id] || 0) + Number(r.total_score);
          }
        });

        const sorted = Object.entries(userScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        // Fetch display names
        const userIds = sorted.map(([id]) => id);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", userIds);

          const nameMap: Record<string, string> = {};
          profiles?.forEach((p) => {
            nameMap[p.id] = p.display_name || "ব্যবহারকারী";
          });

          setLeaderboard(
            sorted.map(([id, score], i) => ({
              rank: i + 1,
              name: nameMap[id] || "ব্যবহারকারী",
              score: Math.round(score),
            }))
          );
        }
      }

      // Count unique users
      const { count: profileCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      setStudentCount(profileCount || 0);
    };
    fetchLeaderboard();
  }, []);

  const handleCTA = () => {
    setAuthOpen(true);
  };

  const rankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "👤";
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {/* ── Public Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
        <div className="container max-w-6xl flex h-16 items-center justify-between px-4">
          <span className="text-2xl font-bold text-primary">প্রস্তুতি</span>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ফিচারসমূহ
            </a>
            <a
              href="#benefits"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              সুবিধা
            </a>
            <a
              href="#leaderboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              লিডারবোর্ড
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              মতামত
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCTA}
              className="gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              লগইন / সাইন আপ
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 dark:from-primary/5 dark:via-secondary/10 dark:to-accent/5" />
        <div className="relative container max-w-5xl px-4 py-20 md:py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Flame className="h-4 w-4" />
              বাংলাদেশের #১ চাকরি প্রস্তুতি প্ল্যাটফর্ম
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-4">
              আপনার সরকারি চাকরির{" "}
              <span className="text-primary">প্রস্তুতি</span> শুরু করুন আজই
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              মক টেস্ট দিন · বিশ্লেষণ করুন · উন্নতি করুন · প্রতিযোগিতা করুন
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[52px] text-base px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
                onClick={handleCTA}
              >
                Start Free Mock Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-[52px] text-base px-8"
                onClick={handleCTA}
              >
                Join Now — বিনামূল্যে!
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            {[
              `${studentCount > 0 ? studentCount.toLocaleString() : "১০,০০০"}+ শিক্ষার্থী`,
              "৫০০+ মক টেস্ট প্রশ্ন",
              "১০০% ফ্রি",
            ].map((point) => (
              <div
                key={point}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof Banner ── */}
      <section className="bg-primary py-4">
        <div className="container max-w-5xl px-4">
          <div className="flex items-center justify-center gap-3 text-primary-foreground">
            <Users className="h-5 w-5" />
            <p className="text-sm md:text-base font-medium">
              {studentCount > 0
                ? `${studentCount.toLocaleString()}+ students practicing — Join them now!`
                : "Join thousands of students preparing for their dream job!"}
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-16 md:py-20">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              সাফল্যের জন্য যা যা দরকার
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              একটি প্ল্যাটফর্মে আপনার প্রস্তুতির সবকিছু
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {features.map((feature, i) => (
              <Card
                key={feature.titleEn}
                className="group card-shadow hover-scale cursor-default border-border/50 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/70 mb-2">
                    {feature.titleEn}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits Section ── */}
      <section
        id="benefits"
        className="py-16 md:py-20 bg-secondary/5 dark:bg-secondary/10"
      >
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              কেন প্রস্তুতি ব্যবহার করবেন?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              আপনার সাফল্যের পথকে সহজ ও কার্যকর করতে
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-card border border-border/50 card-shadow animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview ── */}
      <section id="leaderboard" className="py-16 md:py-20">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              🏆 লিডারবোর্ড
            </h2>
            <p className="text-muted-foreground">শীর্ষ পারফর্মারদের তালিকা</p>
          </div>
          <Card className="max-w-lg mx-auto card-shadow border-border/50 overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              {leaderboard.length > 0 ? (
                leaderboard.map((u, i) => (
                  <div
                    key={u.rank}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${
                      i !== leaderboard.length - 1
                        ? "border-b border-border/50"
                        : ""
                    } ${u.rank <= 3 ? "bg-accent/5" : ""}`}
                  >
                    <span className="text-2xl w-8 text-center">
                      {rankEmoji(u.rank)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        স্কোর: {u.score}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      #{u.rank}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                  <p className="text-sm">
                    এখনো কোনো ডেটা নেই — প্রথম পরীক্ষা দিয়ে শীর্ষে উঠুন!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center mt-6">
            <Button variant="outline" className="hover-scale" onClick={handleCTA}>
              সম্পূর্ণ লিডারবোর্ড দেখুন
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        id="testimonials"
        className="py-16 md:py-20 bg-secondary/5 dark:bg-secondary/10"
      >
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              শিক্ষার্থীদের মতামত
            </h2>
            <p className="text-muted-foreground">
              যারা ইতোমধ্যে প্রস্তুতি নিচ্ছে তাদের অভিজ্ঞতা
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                className="card-shadow border-border/50 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{t.text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl px-4 text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            আজই শুরু করুন — সম্পূর্ণ বিনামূল্যে! 🚀
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            হাজারো শিক্ষার্থী ইতোমধ্যে প্রস্তুতি নিচ্ছে। আপনিও শুরু করুন!
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[52px] text-base px-10 shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
            onClick={handleCTA}
          >
            Start Free Mock Test
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 bg-card">
        <div className="container max-w-5xl px-4 text-center">
          <p className="text-2xl font-bold text-primary mb-2">প্রস্তুতি</p>
          <p className="text-sm text-muted-foreground">
            বাংলাদেশের সরকারি চাকরি প্রস্তুতির বিশ্বস্ত সঙ্গী
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Prostuti. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Sticky CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-lg border-t border-border/50 md:hidden">
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[48px] text-base shadow-lg"
          onClick={handleCTA}
        >
          Start Free Mock Test
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Bottom spacer for sticky CTA on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
