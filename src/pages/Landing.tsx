import { useState } from "react";
import { ArrowRight, BookOpen, Target, BarChart3, Trophy, Users, CheckCircle, Flame, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: BookOpen,
    title: "মক টেস্ট",
    titleEn: "Mock Tests",
    description: "BCS প্রিলি ও অন্যান্য পরীক্ষার মডেল টেস্ট দিন এবং নিজেকে যাচাই করুন।",
  },
  {
    icon: Target,
    title: "বিষয়ভিত্তিক অনুশীলন",
    titleEn: "Subject Practice",
    description: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান — প্রতিটি বিষয় আলাদাভাবে প্র্যাকটিস করুন।",
  },
  {
    icon: BarChart3,
    title: "ভুল ট্র্যাকার",
    titleEn: "Mistake Tracker",
    description: "কোথায় ভুল হচ্ছে তা বিশ্লেষণ করুন এবং দুর্বলতা কাটিয়ে উঠুন।",
  },
  {
    icon: Trophy,
    title: "লিডারবোর্ড",
    titleEn: "Leaderboard",
    description: "হাজারো শিক্ষার্থীর সাথে প্রতিযোগিতা করুন এবং নিজের অবস্থান দেখুন।",
  },
];

const leaderboardData = [
  { rank: 1, name: "রাফিদ আহমেদ", score: 982, avatar: "🥇" },
  { rank: 2, name: "তাসনিম জাহান", score: 964, avatar: "🥈" },
  { rank: 3, name: "সাকিব হাসান", score: 951, avatar: "🥉" },
  { rank: 4, name: "ফারিয়া আক্তার", score: 943, avatar: "👤" },
  { rank: 5, name: "মেহেদী হাসান", score: 938, avatar: "👤" },
];

const trustPoints = [
  "১০,০০০+ শিক্ষার্থী প্রতিদিন অনুশীলন করছে",
  "৫০০+ মক টেস্ট",
  "১০০% ফ্রি",
];

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();

  const handleStartTest = () => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 dark:from-primary/5 dark:via-secondary/10 dark:to-accent/5" />
        <div className="relative container max-w-5xl px-4 py-16 md:py-24 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Flame className="h-4 w-4" />
              বাংলাদেশের #১ চাকরি প্রস্তুতি প্ল্যাটফর্ম
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-4">
              আপনার সরকারি চাকরির{" "}
              <span className="text-primary">প্রস্তুতি</span>{" "}
              শুরু করুন আজই
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Practice · Analyze · Improve · Compete
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[52px] text-base px-8 shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
                onClick={handleStartTest}
              >
                Start Free Mock Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/subjects">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[52px] text-base px-8"
                >
                  বিষয় দেখুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {trustPoints.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="bg-primary py-4">
        <div className="container max-w-5xl px-4">
          <div className="flex items-center justify-center gap-3 text-primary-foreground">
            <Users className="h-5 w-5" />
            <p className="text-sm md:text-base font-medium">
              10,000+ students practicing daily — Join them now!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
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
                  <p className="text-xs text-muted-foreground/70 mb-2">{feature.titleEn}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16 md:py-20 bg-secondary/30 dark:bg-secondary/10">
        <div className="container max-w-5xl px-4">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              🏆 লিডারবোর্ড
            </h2>
            <p className="text-muted-foreground">এই সপ্তাহের সেরা ৫ জন</p>
          </div>
          <Card className="max-w-lg mx-auto card-shadow border-border/50 overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              {leaderboardData.map((user, i) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${
                    i !== leaderboardData.length - 1 ? "border-b border-border/50" : ""
                  } ${user.rank <= 3 ? "bg-accent/5" : ""}`}
                >
                  <span className="text-2xl w-8 text-center">{user.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">স্কোর: {user.score}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">#{user.rank}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="text-center mt-6">
            <Link to="/leaderboard">
              <Button variant="outline" className="hover-scale">
                সম্পূর্ণ লিডারবোর্ড দেখুন
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <div className="container max-w-5xl px-4 text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            Join the competition today 🚀
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            হাজারো শিক্ষার্থী ইতোমধ্যে প্রস্তুতি নিচ্ছে। আপনিও শুরু করুন — সম্পূর্ণ বিনামূল্যে!
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[52px] text-base px-10 shadow-lg hover:shadow-xl transition-all duration-200 hover-scale"
            onClick={handleStartTest}
          >
            Start Free Mock Test
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Sticky CTA (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-background/80 backdrop-blur-lg border-t border-border/50 md:hidden">
        <Button
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold min-h-[48px] text-base shadow-lg"
          onClick={handleStartTest}
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
