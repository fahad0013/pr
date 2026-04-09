import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle, XCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_PASSWORD = "$~F4h4d~Pr0$tut1$";

interface SeedLog {
  file: string;
  status: "success" | "error";
  message: string;
}

export default function Seed() {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

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

          <Button
            onClick={seedFiles}
            disabled={seeding || files.length === 0 || !title.trim()}
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