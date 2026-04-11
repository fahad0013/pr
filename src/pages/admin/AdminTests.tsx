import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Test {
  id: number;
  title: string;
  exam_category: string;
  test_type: string;
  status: string;
  duration_minutes: number | null;
}

export default function AdminTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Test | null>(null);
  const [form, setForm] = useState({ title: "", status: "", duration_minutes: 60 });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tests").select("id, title, exam_category, test_type, status, duration_minutes").order("id", { ascending: false });
    if (error) toast.error("পরীক্ষা লোড ব্যর্থ");
    else setTests(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (t: Test) => {
    setEditing(t);
    setForm({ title: t.title, status: t.status, duration_minutes: t.duration_minutes ?? 60 });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase.from("tests").update({
      title: form.title,
      status: form.status,
      duration_minutes: form.duration_minutes,
    }).eq("id", editing.id);
    if (error) toast.error("আপডেট ব্যর্থ");
    else { toast.success("পরীক্ষা আপডেট হয়েছে"); setEditing(null); load(); }
  };

  const deleteTest = async (id: number) => {
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা ব্যর্থ");
    else { toast.success("পরীক্ষা মুছে ফেলা হয়েছে"); load(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">পরীক্ষা ব্যবস্থাপনা</h2>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>শিরোনাম</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>ধরন</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead>সময় (মিনিট)</TableHead>
              <TableHead>অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.id}</TableCell>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.exam_category}</TableCell>
                <TableCell>{t.test_type}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>{t.duration_minutes}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>পরীক্ষা মুছে ফেলবেন?</AlertDialogTitle>
                        <AlertDialogDescription>এটি সংশ্লিষ্ট সকল প্রশ্নও মুছে ফেলবে।</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>বাতিল</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTest(t.id)}>মুছুন</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>পরীক্ষা সম্পাদনা</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>স্ট্যাটাস</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>সময় (মিনিট)</Label>
              <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
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
