import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle, XCircle, Lock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_PASSWORD = "$~F4h4d~Pr0$tut1$";

interface SeedLog {
  file: string;
  status: "success" | "error";
  message: string;
}

interface ParsedFile {
  file: File;
  questions: any[];
  categoryBreakdown: Record<string, number>;
  missingCategory: boolean;
}

export default function Seed() {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      toast.success("অ্যাক্সেস মঞ্জুর হয়েছে!");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected);

    // Parse and validate files immediately
    const parsed: ParsedFile[] = [];
    for (const file of selected) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data) || data.length === 0) {
          parsed.push({ file, questions: [], categoryBreakdown: {}, missingCategory: true });
          continue;
        }
        const missingCategory = data.some((q: any) => !q.category);
        const categoryBreakdown: Record<string, number> = {};
        data.forEach((q: any) => {
          const cat = q.category || "(খালি)";
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
        });
        parsed.push({ file, questions: data, categoryBreakdown, missingCategory });
      } catch {
        parsed.push({ file, questions: [], categoryBreakdown: {}, missingCategory: true });
      }
    }
    setParsedFiles(parsed);
  };

  const hasValidationErrors = parsedFiles.some((p) => p.missingCategory || p.questions.length === 0);

  const seedFiles = async () => {
    if (!user) {
      toast.error("লগইন করুন");
      return;
    }
    if (!title.trim()) {
      toast.error("টাইটেল দিন");
      return;
    }
    if (files.length === 0) {
      toast.error("কোনো ফাইল নির্বাচন করা হয়নি");
      return;
    }

    if (hasValidationErrors) {
      toast.error("কিছু ফাইলে category ফিল্ড নেই। আপলোড বাতিল।");
      return;
    }

    setSeeding(true);
    setLogs([]);
    const newLogs: SeedLog[] = [];

    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("JSON must be a non-empty array");
        }

        const questionCount = parsed.length;

        // Step A: Insert test — always 'live' type
        const { data: testData, error: testError } = await supabase
          .from("tests")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            test_type: "live",
            duration_minutes: 60,
            status: "live",
          } as any)
          .select("id")
          .single();

        if (testError || !testData) {
          throw new Error(testError?.message || "Failed to insert test");
        }

        const testId = (testData as any).id;

        // Step B: Map questions with test_id
        const questions = parsed.map((q: any) => ({
          test_id: testId,
          category: q.category || null,
          subject: q.category || null,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
        }));

        // Step C: Bulk insert questions (batch 500 at a time)
        for (let i = 0; i < questions.length; i += 500) {
          const batch = questions.slice(i, i + 500);
          const { error: qError } = await supabase
            .from("questions")
            .insert(batch);

          if (qError) {
            throw new Error(`Questions insert error: ${qError.message}`);
          }
        }

        const msg = `✅ ${file.name}: ${questionCount} questions → Live Exam (test_id: ${testId})`;
        console.log(msg);
        newLogs.push({ file: file.name, status: "success", message: msg });
        toast.success(`${file.name} সফলভাবে সিড হয়েছে`);
      } catch (err: any) {
        const msg = `❌ ${file.name}: ${err.message}`;
        console.error(msg);
        newLogs.push({ file: file.name, status: "error", message: msg });
        toast.error(`${file.name} সিড করতে ব্যর্থ`);
      }
    }

    setLogs(newLogs);
    setSeeding(false);
    setFiles([]);
    setTitle("");
    setDescription("");
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">Admin Access Only</CardTitle>
            <p className="text-sm text-muted-foreground">এই পেজে প্রবেশ করতে পাসওয়ার্ড দিন</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড"
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            <Button onClick={handleUnlock} className="w-full min-h-[44px] font-semibold">
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">🌱 Database Seeder</CardTitle>
          <p className="text-sm text-muted-foreground">
            JSON ফাইল আপলোড করুন — সব প্রশ্ন একটি Live Exam হিসেবে সেভ হবে
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seed-title">টাইটেল <span className="text-destructive">*</span></Label>
            <Input
              id="seed-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: প্রাথমিক শিক্ষক মক টেস্ট — ০১"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed-desc">বিবরণ</Label>
            <Input
              id="seed-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="যেমন: প্রাথমিক শিক্ষক নিয়োগ পরীক্ষার প্রশ্ন সমাধান - ২০২২"
            />
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            {files.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {files.length}টি ফাইল নির্বাচিত
              </p>
            )}
          </div>

          {/* Category Preview */}
          {parsedFiles.length > 0 && (
            <div className="space-y-2">
              {parsedFiles.map((pf, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-md text-sm ${
                    pf.missingCategory || pf.questions.length === 0
                      ? "bg-destructive/10 border border-destructive/30"
                      : "bg-primary/10 border border-primary/30"
                  }`}
                >
                  <div className="font-medium flex items-center gap-1.5 mb-1">
                    {pf.missingCategory || pf.questions.length === 0 ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                    {pf.file.name} — {pf.questions.length} প্রশ্ন
                  </div>
                  {pf.missingCategory && pf.questions.length > 0 && (
                    <p className="text-destructive text-xs">⚠️ কিছু প্রশ্নে category ফিল্ড নেই</p>
                  )}
                  {pf.questions.length === 0 && (
                    <p className="text-destructive text-xs">⚠️ ফাইলটি পার্স করা যায়নি বা খালি</p>
                  )}
                  {Object.keys(pf.categoryBreakdown).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.entries(pf.categoryBreakdown).map(([cat, count]) => (
                        <span
                          key={cat}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            cat === "(খালি)"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cat}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={seedFiles}
            disabled={seeding || hasValidationErrors || files.length === 0 || !title.trim()}
            className="w-full min-h-[44px] font-semibold"
          >
            {seeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                সিড হচ্ছে...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>

          {logs.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-sm p-2 rounded-md ${
                    log.status === "success"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {log.status === "success" ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}