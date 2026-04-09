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
  PlayCircle,
  AlertCircle,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    icon: BookOpen,
    title: "পরীক্ষার ভীতি দূর করুন",
    titleEn: "Mock Tests",
    description:
      "বাস্তব পরীক্ষার সিমুলেশনের মাধ্যমে মক টেস্ট দিন এবং পরীক্ষার ভীতি দূর করে আত্মবিশ্বাস বাড়ান।",
  },
  {
    icon: Target,
    title: "দুর্বল বিষয়গুলো চিহ্নিত করুন",
    titleEn: "Subject Practice",
    description:
      "বিষয়ভিত্তিক অনুশীলনের মাধ্যমে আপনার নির্দিষ্ট দুর্বল বিষয়গুলো খুঁজে বের করে প্রস্তুতি আরও শাণিত করুন।",
  },
  {
    icon: BarChart3,
    title: "ভুল থেকে শিখুন",
    titleEn: "Mistake Tracker",
    description:
      "কোথায় ভুল হচ্ছে তা বিস্তারিত এনালাইসিস করে একই ভুলের পুনরাবৃত্তি রোধ করুন।",
  },
  {
    icon: Trophy,
    title: "নিজের অবস্থান জানুন",
    titleEn: "Leaderboard",
    description:
      "হাজারো প্রতিযোগীর মাঝে আপনি কোথায় আছেন তা লিডারবোর্ডের মাধ্যমে জেনে নিন।",
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

const faqs = [
  {
    question: "অ্যাপটি কি একদম ফ্রি?",
    answer: "হ্যাঁ, আমাদের প্ল্যাটফর্মের বেসিক মক টেস্ট এবং ট্র্যাকিং ফিচারগুলো সম্পূর্ণ ফ্রি।"
  },
  {
    question: "কারা এটি ব্যবহার করতে পারবে?",
    answer: "যেকোনো সরকারি চাকরি, বিসিএস, ব্যাংক বা প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার্থীরা আমাদের প্ল্যাটফর্ম ব্যবহার করতে পারবেন।"
  },
  {
    question: "প্রশ্নগুলো কতটা রিলায়েবল?",
    answer: "আমাদের প্রশ্নব্যাংক বিশেষজ্ঞ মডারেটরদের দ্বারা যাচাইকৃত এবং বিগত সালের প্রশ্নের আলোকে তৈরি।"
  },
  {
    question: "আমি কি মোবাইলে পরীক্ষা দিতে পারব?",
    answer: "অবশ্যই! আমাদের ওয়েবসাইটটি সম্পূর্ণ মোবাইল-ফ্রেন্ডলি হওয়ায় যেকোনো ডিভাইস থেকে সহজে পরীক্ষা দেওয়া যায়।"
  }
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

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
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

      {/* ── Floating Actions ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-card/80 backdrop-blur-md shadow-sm"
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
          className="gap-1.5 bg-card/80 backdrop-blur-md shadow-sm"
        >
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Button>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 dark:from-primary/5 dark:via-secondary/10 dark:to-accent/5" />
        <div className="relative container max-w-6xl px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Flame className="h-4 w-4" />
              টেস্ট দিন, বিশ্লেষণ করুন, এগিয়ে থাকুন
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
              চাকরি প্রস্তুতিতে আপনি কতটা <span className="text-primary">এগিয়ে?</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              হাজারো শিক্ষার্থীদের সাথে আজই ফ্রি মক টেস্ট দিয়ে নিজের অবস্থান যাচাই করুন এবং দুর্বলতা কাটিয়ে তুলুন।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[56px] text-base px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
                onClick={handleCTA}
              >
                Free Mock Test দিন এখনই
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-[56px] text-base px-8 bg-background/50 backdrop-blur-sm"
                onClick={() => scrollToSection('how-it-works')}
              >
                কীভাবে কাজ করে দেখুন <PlayCircle className="ml-2 h-5 w-5 opacity-70" />
              </Button>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> সম্পূর্ণ ফ্রি</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> রিয়েল-টাইম লিডারবোর্ড</span>
              <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> এনালাইটিক্স সুবিধা</span>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-md lg:max-w-none animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border/50 rounded-2xl shadow-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <UserIcon />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Dashboard Overview</h3>
                    <p className="text-xs text-muted-foreground">Your Performance</p>
                  </div>
                </div>
                <div className="h-8 w-24 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-accent-foreground">Score: 82%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="text-xl font-bold">+15%</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <Trophy className="h-6 w-6 text-accent mb-2" />
                    <p className="text-xs text-muted-foreground">Global Rank</p>
                    <p className="text-xl font-bold">#42</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem-Solution Section ── */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">প্রস্তুতি নিয়ে আপনিও কি চিন্তিত?</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-destructive/5 border-destructive/20 card-shadow">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">প্রস্তুতির সঠিক গাইডলাইন নেই?</h3>
                <p className="text-sm text-muted-foreground">বই তো অনেক পড়ছেন, কিন্তু আপনার প্রস্তুতি আসলেই কতটা কার্যকর তা বুঝতে পারছেন না।</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20 card-shadow">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">কোথায় ভুল হচ্ছে জানেন না?</h3>
                <p className="text-sm text-muted-foreground">বারবার একই ভুল করে নম্বর হারাচ্ছেন, দুর্বল জায়গাগুলো চিহ্নিত করতে পারছেন না।</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20 card-shadow">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">প্রতিযোগিতায় পিছিয়ে পড়ছেন?</h3>
                <p className="text-sm text-muted-foreground">অন্যান্য হাজারো প্রতিযোগীর তুলনায় আপনার অবস্থা কোথায় তা জানার কোনো উপায় নেই।</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border border-border shadow-lg rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute pointer-events-none inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-foreground">প্রস্তুতি অ্যাপ দিয়ে আজই আপনার দুর্বলতা কাটিয়ে উঠুন!</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">আমাদের সিস্টেমে রেগুলার টেস্ট দিয়ে আপনি শুধু ভুলগুলোই ধরতে পারবেন না, পারবেন ধাপে ধাপে নিজের স্কোরে উন্নতি আনতে।</p>
              <Button size="lg" className="hover-scale shadow-md" onClick={handleCTA}>সমস্যাগুলো সমাধান করুন</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">কীভাবে কাজ করে?</h2>
            <p className="text-muted-foreground">৩টি সহজ ধাপে আপনার প্রস্তুতি শুরু করুন</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -translate-y-1/2 z-0" />
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-card border-2 border-primary text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">১</div>
              <h3 className="text-xl font-bold mb-3">লগইন করুন</h3>
              <p className="text-muted-foreground text-sm">সহজেই ইমেইল দিয়ে একটি ফ্রি একাউন্ট তৈরি করুন এবং ড্যাশবোর্ডে প্রবেশ করুন।</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-primary/30">২</div>
              <h3 className="text-xl font-bold mb-3">মক টেস্ট দিন</h3>
              <p className="text-muted-foreground text-sm">বিষয়ভিত্তিক বা সম্পূর্ণ মডেল টেস্ট দিয়ে রিয়েল-টাইম পরীক্ষার অভিজ্ঞতা নিন।</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-card border-2 border-accent text-accent rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">৩</div>
              <h3 className="text-xl font-bold mb-3">উন্নতি করুন</h3>
              <p className="text-muted-foreground text-sm">বিস্তারিত রিপোর্ট দেখে নিজের ভুল থেকে শিখুন এবং লিডারবোর্ডে এগিয়ে থাকুন।</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features & Benefits Section ── */}
      <section id="features" className="py-20 bg-secondary/5">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">কেন আমাদের প্ল্যাটফর্ম সেরা?</h2>
            <p className="text-muted-foreground">আপনার সাফল্যের পথ সহজ করতে আমরা দিচ্ছি</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <Card
                key={feature.titleEn}
                className="group card-shadow hover-scale cursor-default border-border/50 bg-card overflow-hidden"
              >
                <div className="flex h-full flex-col md:flex-row">
                  <div className="p-6 md:pr-0 self-start md:self-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <feature.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <CardContent className="p-6 pt-2 md:pt-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="shadow-lg hover-scale" onClick={handleCTA}>সব ফিচার ব্যবহার করে দেখুন</Button>
          </div>
        </div>
      </section>

      {/* ── Psychological Trigger Section (Urgency / FOMO) ── */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent hidden md:block" />
        
        <div className="container max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            সঠিক অনুশীলনের অভাবে ৮০% পরীক্ষার্থী পিছিয়ে পড়ে!
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            শুধু পড়ালেই হবে না, পরীক্ষার হলে টাইম ম্যানেজমেন্ট ও সঠিক উত্তর নির্বাচনের স্কিল যাচাই করতে এখনই মক টেস্ট দিন। আপনার প্রতিযোগী হয়তো এখনই টেস্ট দিচ্ছে, আপনি পিছিয়ে থাকবেন কেন?
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-primary font-bold text-lg h-14 px-10 shadow-2xl hover:scale-105 transition-transform"
            onClick={handleCTA}
          >
            অন্যদের থেকে এগিয়ে থাকুন
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* ── Social Proof Banner ── */}
      <section className="bg-card border-b py-6 overflow-hidden w-full overflow-x-hidden">
        <div className="container max-w-5xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-foreground">
            <div className="flex -space-x-3">
              <Avatar className="border-2 border-background w-10 h-10"><img src="https://i.pravatar.cc/100?img=1" alt="Student" /></Avatar>
              <Avatar className="border-2 border-background w-10 h-10"><img src="https://i.pravatar.cc/100?img=2" alt="Student" /></Avatar>
              <Avatar className="border-2 border-background w-10 h-10"><img src="https://i.pravatar.cc/100?img=3" alt="Student" /></Avatar>
              <Avatar className="border-2 border-background w-10 h-10 bg-primary text-primary-foreground text-xs font-bold items-center justify-center">10k+</Avatar>
            </div>
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start text-yellow-500 mb-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm font-medium">
                {studentCount > 0
                  ? `${studentCount.toLocaleString()}+ শিক্ষার্থী আমাদের সাথেই প্রস্তুতি নিচ্ছে!`
                  : "১০ হাজারেরও বেশি শিক্ষার্থীর ভরসা!"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview ── */}
      <section id="leaderboard" className="py-20 bg-muted/20">
        <div className="container max-w-4xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">🏆 টপ পারফর্মারস</h2>
            <p className="text-muted-foreground">লিডারবোর্ড দেখে জানুন আপনি কোথায় আছেন</p>
          </div>
          <Card className="mx-auto card-shadow border-border overflow-hidden">
            <div className="bg-card p-4 border-b border-border flex justify-between items-center text-sm font-medium text-muted-foreground bg-muted/50">
              <span className="w-16 text-center">Rank</span>
              <span className="flex-1 px-4">Student</span>
              <span className="w-20 text-right pr-4">Score</span>
            </div>
            <CardContent className="p-0 bg-card">
              {leaderboard.length > 0 ? (
                leaderboard.map((u, i) => (
                  <div
                    key={u.rank}
                    className={`flex items-center px-4 py-4 transition-colors hover:bg-muted/50 ${
                      i !== leaderboard.length - 1 ? "border-b border-border" : ""
                    } ${u.rank <= 3 ? "bg-accent/5 font-semibold" : ""}`}
                  >
                    <span className="text-2xl w-16 text-center">
                      {rankEmoji(u.rank)}
                    </span>
                    <div className="flex-1 min-w-0 px-2">
                      <p className="text-foreground truncate text-base">
                        {u.name}
                      </p>
                    </div>
                    <span className="text-base font-bold text-foreground w-20 text-right pr-4">
                      {u.score}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-muted-foreground">
                  <LayoutDashboard className="h-10 w-10 mx-auto mb-3 text-muted" />
                  <p className="text-sm">ডেটা লোড হচ্ছে অথবা এই সপ্তাহে কোনো টেস্ট দেওয়া হয়নি।</p>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="text-center mt-10">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 hover-scale shadow-lg" onClick={handleCTA}>
              প্রতিযোগিতায় আপনিও যোগ দিন!
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-20 text-center">
        <div className="container max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12">শিক্ষার্থীদের মতামত</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {testimonials.map((t, i) => (
              <Card key={i} className="card-shadow border-border bg-card hover:-translate-y-1 transition-transform">
                <CardContent className="p-8">
                  <div className="flex text-yellow-500 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic mb-6">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-3xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">সাধারণ জিজ্ঞাসা (FAQ)</h2>
            <p className="text-muted-foreground">আপনার মনে কোনো প্রশ্ন থাকলে এখান থেকে জেনে নিন</p>
          </div>
          <Card className="p-2 border-border/50">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="px-4">
                  <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-32">
        <div className="container max-w-3xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
            আর দেরি কেন? সফলতার যাত্রা শুরু হোক আজই! 🚀
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            হাজারো শিক্ষার্থী ইতোমধ্যে প্রস্তুতি নিচ্ছে। একটি ফ্রি একাউন্ট তৈরি করে আপনিও যোগ দিন।
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold min-h-[60px] text-lg px-12 shadow-2xl hover-scale"
            onClick={handleCTA}
          >
            ফ্রি একাউন্ট খুলুন
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-12 bg-card">
        <div className="container max-w-5xl px-4 text-center">
          <p className="text-3xl font-extrabold text-primary mb-4 tracking-tighter">প্রস্তুতি</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
            বাংলাদেশের সরকারি চাকরি, বিসিএস এবং অন্যান্য প্রতিযোগিতামূলক পরীক্ষা প্রস্তুতির বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম।
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-8">
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-foreground transition-colors">How it works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToSection('leaderboard')} className="hover:text-foreground transition-colors">Leaderboard</button>
          </div>
          <p className="text-xs text-muted-foreground border-t border-border pt-8">
            © {new Date().getFullYear()} Prostuti (প্রস্তুতি). All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Sticky CTA (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-xl border-t border-border md:hidden shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-14 text-base shadow-lg animate-bounce"
          style={{ animationDuration: '3s' }}
          onClick={handleCTA}
        >
          ফ্রি মক টেস্ট দিন এখনই
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Bottom spacer for sticky CTA on mobile */}
      <div className="h-24 md:hidden" />
    </div>
  );
}

// Simple dummy icon for UI mockup
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-5 w-5 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}
