import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import SubjectSets from "./pages/SubjectSets";
import LiveExam from "./pages/LiveExam";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import ExamRoom from "./pages/ExamRoom";
import ExamResult from "./pages/ExamResult";
import ErrorBank from "./pages/ErrorBank";
import NotFound from "./pages/NotFound";
import Seed from "./pages/Seed";

const queryClient = new QueryClient();

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setCheckDone(true);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()
      .then(({ data }: any) => {
        if (data && !data.onboarding_completed) {
          setShowOnboarding(true);
        }
        setCheckDone(true);
      });
  }, [user, loading]);

  if (!checkDone) return null;

  return (
    <>
      <OnboardingFlow
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
      {children}
    </>
  );
}

function DashboardAppLayout() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </OnboardingGate>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />

            {/* Exam routes (full screen, no layout) */}
            <Route path="/exam/:examId" element={<ExamRoom />} />
            <Route path="/exam-result" element={<ExamResult />} />
            <Route path="/seed" element={<Seed />} />

            {/* Protected Dashboard */}
            <Route path="/dashboard" element={<DashboardAppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="subjects/:subject" element={<SubjectSets />} />
              <Route path="live-exam" element={<LiveExam />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="error-bank" element={<ErrorBank />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
