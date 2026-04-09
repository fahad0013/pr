import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type Step = "initial" | "otp-sent" | "verifying" | "success" | "error";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<Step>("initial");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setStep("initial");
    setEmail("");
    setOtp("");
    setError("");
    setLoading(false);
  }, []);

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setStep("otp-sent");
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    setStep("verifying");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (error) {
      setError(error.message);
      setStep("otp-sent");
      setLoading(false);
    } else {
      setStep("success");
      setLoading(false);
      setTimeout(() => handleOpenChange(false), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden border-border/50">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-6 pb-4 text-center">
          <DialogTitle className="text-2xl font-bold text-foreground">
            প্রস্তুতি
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        <div className="p-6 pt-4 space-y-4">
          {/* Success State */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-8 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary animate-[scale-in_0.3s_ease-out]" />
              </div>
              <p className="text-lg font-semibold text-foreground">স্বাগতম! 🎉</p>
              <p className="text-sm text-muted-foreground">সফলভাবে লগইন হয়েছে</p>
            </div>
          )}

          {/* Error Banner */}
          {error && step !== "success" && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step !== "success" && (
            <>
              {step === "initial" && (
                <div className="space-y-4 animate-fade-in">
                  {/* Google Login */}
                  <Button
                    variant="outline"
                    className="w-full min-h-[48px] text-base font-medium gap-3"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Google দিয়ে লগইন করুন
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">অথবা</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Email OTP */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-email" className="text-sm">ইমেইল</Label>
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      className="w-full min-h-[48px] text-base font-medium"
                      onClick={handleSendOtp}
                      disabled={loading || !email.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Mail className="h-5 w-5" />
                      )}
                      OTP পাঠান
                    </Button>
                  </div>
                </div>
              )}

              {(step === "otp-sent" || step === "verifying") && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{email}</span> এ একটি কোড পাঠানো হয়েছে
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp-code" className="text-sm">OTP কোড</Label>
                    <Input
                      id="otp-code"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                      disabled={step === "verifying"}
                      className="text-center text-lg tracking-[0.3em] font-mono"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  <Button
                    className="w-full min-h-[48px] text-base font-medium"
                    onClick={handleVerifyOtp}
                    disabled={step === "verifying" || !otp.trim()}
                  >
                    {step === "verifying" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : null}
                    যাচাই করুন
                  </Button>
                  <button
                    onClick={() => { setStep("initial"); setOtp(""); setError(""); }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← অন্য ইমেইল ব্যবহার করুন
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
