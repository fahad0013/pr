import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RankedUser {
  user_id: string;
  display_name: string | null;
  district: string | null;
  avg_score: number;
  tests_taken: number;
  banned: boolean;
}

export default function AdminLeaderboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("");
  const [testFilter, setTestFilter] = useState("");
  const [banDialog, setBanDialog] = useState<RankedUser | null>(null);
  const [banReason, setBanReason] = useState("");

  const load = async () => {
    setLoading(true);

    let resultsQuery = supabase.from("results").select("user_id, total_score, test_id");
    if (testFilter) resultsQuery = resultsQuery.eq("test_id", parseInt(testFilter));

    const [resultsRes, profilesRes, bansRes] = await Promise.all([
      resultsQuery,
      supabase.from("profiles").select("id, display_name, district"),
      supabase.from("leaderboard_bans").select("user_id"),
    ]);

    const profileMap = new Map((profilesRes.data ?? []).map(p => [p.id, p]));
    const bannedSet = new Set((bansRes.data ?? []).map(b => b.user_id));

    const userScores: Record<string, { total: number; count: number }> = {};
    (resultsRes.data ?? []).forEach(r => {
      if (!r.user_id) return;
      if (!userScores[r.user_id]) userScores[r.user_id] = { total: 0, count: 0 };
      userScores[r.user_id].total += Number(r.total_score) || 0;
      userScores[r.user_id].count++;
    });

    let ranked: RankedUser[] = Object.entries(userScores).map(([uid, s]) => {
      const profile = profileMap.get(uid);
      return {
        user_id: uid,
        display_name: profile?.display_name ?? null,
        district: profile?.district ?? null,
        avg_score: Math.round(s.total / s.count),
        tests_taken: s.count,
        banned: bannedSet.has(uid),
      };
    }).sort((a, b) => b.avg_score - a.avg_score);

    if (districtFilter) {
      ranked = ranked.filter(r => (r.district ?? "").toLowerCase().includes(districtFilter.toLowerCase()));
    }

    setRankings(ranked);
    setLoading(false);
  };

  useEffect(() => { load(); }, [testFilter, districtFilter]);

  const banUser = async () => {
    if (!banDialog || !user) return;
    const { error } = await supabase.from("leaderboard_bans").insert({
      user_id: banDialog.user_id,
      banned_by: user.id,
      reason: banReason || null,
    });
    if (error) toast.error("ব্যান ব্যর্থ");
    else { toast.success("ব্যবহারকারী ব্যান হয়েছে"); setBanDialog(null); setBanReason(""); load(); }
  };

  const unbanUser = async (uid: string) => {
    const { error } = await supabase.from("leaderboard_bans").delete().eq("user_id", uid);
    if (error) toast.error("আনব্যান ব্যর্থ");
    else { toast.success("ব্যবহারকারী আনব্যান হয়েছে"); load(); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">লিডারবোর্ড নিয়ন্ত্রণ</h2>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Test ID" value={testFilter} onChange={(e) => setTestFilter(e.target.value)} className="max-w-[120px]" />
        <Input placeholder="জেলা" value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="max-w-[200px]" />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>নাম</TableHead>
              <TableHead>জেলা</TableHead>
              <TableHead>গড় স্কোর</TableHead>
              <TableHead>পরীক্ষা</TableHead>
              <TableHead>অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((r, i) => (
              <TableRow key={r.user_id} className={r.banned ? "opacity-50" : ""}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.display_name ?? "—"}</TableCell>
                <TableCell>{r.district ?? "—"}</TableCell>
                <TableCell>{r.avg_score}%</TableCell>
                <TableCell>{r.tests_taken}</TableCell>
                <TableCell>
                  {r.banned ? (
                    <Button size="sm" variant="outline" onClick={() => unbanUser(r.user_id)}>
                      <ShieldCheck className="h-4 w-4 mr-1" /> আনব্যান
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => setBanDialog(r)}>
                      <ShieldBan className="h-4 w-4 mr-1" /> ব্যান
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!banDialog} onOpenChange={() => setBanDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{banDialog?.display_name ?? "User"} ব্যান করুন</DialogTitle></DialogHeader>
          <div>
            <Label>কারণ (ঐচ্ছিক)</Label>
            <Textarea value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={banUser}>ব্যান নিশ্চিত করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
