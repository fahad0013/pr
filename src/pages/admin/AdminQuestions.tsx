import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface Question {
  id: number;
  question_text: string;
  options: Json;
  correct_answer: string;
  explanation: string | null;
  subject: string | null;
  category: string | null;
  test_id: number | null;
}

const PAGE_SIZE = 20;

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [testFilter, setTestFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState<Question | null>(null);
  const [form, setForm] = useState({ question_text: "", options: "", correct_answer: "", explanation: "" });

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("questions").select("id, question_text, options, correct_answer, explanation, subject, category, test_id", { count: "exact" });
    if (testFilter) query = query.eq("test_id", parseInt(testFilter));
    if (subjectFilter) query = query.eq("subject", subjectFilter);
    if (categoryFilter) query = query.eq("category", categoryFilter);
    query = query.order("id", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error) toast.error("প্রশ্ন লোড ব্যর্থ");
    else { setQuestions(data ?? []); setTotal(count ?? 0); }
    setLoading(false);
  }, [page, testFilter, subjectFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({
      question_text: q.question_text,
      options: JSON.stringify(q.options, null, 2),
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? "",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    let parsedOptions: Json;
    try { parsedOptions = JSON.parse(form.options); }
    catch { toast.error("Options JSON ভুল"); return; }

    const { error } = await supabase.from("questions").update({
      question_text: form.question_text,
      options: parsedOptions,
      correct_answer: form.correct_answer,
      explanation: form.explanation || null,
    }).eq("id", editing.id);
    if (error) toast.error("আপডেট ব্যর্থ");
    else { toast.success("প্রশ্ন আপডেট হয়েছে"); setEditing(null); load(); }
  };

  const deleteQuestion = async (id: number) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা ব্যর্থ");
    else { toast.success("প্রশ্ন মুছে ফেলা হয়েছে"); load(); }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">প্রশ্ন ব্যবস্থাপনা</h2>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Test ID" value={testFilter} onChange={(e) => { setTestFilter(e.target.value); setPage(0); }} className="max-w-[120px]" />
        <Input placeholder="Subject" value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setPage(0); }} className="max-w-[150px]" />
        <Input placeholder="Category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }} className="max-w-[150px]" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="max-w-[300px]">প্রশ্ন</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>সঠিক উত্তর</TableHead>
                <TableHead>অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.id}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{q.question_text}</TableCell>
                  <TableCell>{q.subject ?? "—"}</TableCell>
                  <TableCell>{q.category ?? "—"}</TableCell>
                  <TableCell>{q.correct_answer}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(q)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>প্রশ্ন মুছবেন?</AlertDialogTitle>
                          <AlertDialogDescription>এটি স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteQuestion(q.id)}>মুছুন</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">মোট {total}টি প্রশ্ন — পাতা {page + 1}/{totalPages || 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>প্রশ্ন সম্পাদনা</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>প্রশ্ন</Label>
              <Textarea rows={3} value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
            </div>
            <div>
              <Label>Options (JSON)</Label>
              <Textarea rows={5} className="font-mono text-xs" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            </div>
            <div>
              <Label>সঠিক উত্তর</Label>
              <Input value={form.correct_answer} onChange={(e) => setForm({ ...form, correct_answer: e.target.value })} />
            </div>
            <div>
              <Label>ব্যাখ্যা</Label>
              <Textarea rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveEdit}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
