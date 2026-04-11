import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) toast.error("ঘোষণা লোড ব্যর্থ");
    else setAnnouncements(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!title.trim() || !content.trim()) { toast.error("শিরোনাম ও বিষয়বস্তু দিন"); return; }
    setSending(true);
    const { error } = await supabase.from("announcements").insert({
      title: title.trim(),
      content: content.trim(),
      created_by: user?.id ?? null,
    });
    if (error) toast.error("ঘোষণা পাঠানো ব্যর্থ");
    else { toast.success("ঘোষণা পাঠানো হয়েছে"); setTitle(""); setContent(""); load(); }
    setSending(false);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("announcements").update({ is_active: !isActive }).eq("id", id);
    if (error) toast.error("আপডেট ব্যর্থ");
    else load();
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা ব্যর্থ");
    else { toast.success("ঘোষণা মুছে ফেলা হয়েছে"); load(); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">নোটিফিকেশন ও ঘোষণা</h2>

      <Card>
        <CardHeader><CardTitle>নতুন ঘোষণা পাঠান</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>শিরোনাম</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ঘোষণার শিরোনাম..." />
          </div>
          <div>
            <Label>বিষয়বস্তু</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="বিস্তারিত লিখুন..." rows={3} />
          </div>
          <Button onClick={send} disabled={sending}>
            <Send className="h-4 w-4 mr-2" /> পাঠান
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>সকল ঘোষণা</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : announcements.length === 0 ? (
            <p className="text-muted-foreground">কোনো ঘোষণা নেই।</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString("bn-BD")}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a.id, a.is_active)} />
                    <Button size="sm" variant="destructive" onClick={() => deleteAnnouncement(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
