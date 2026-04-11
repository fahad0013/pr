import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  district: string | null;
  institution: string | null;
  current_streak: number | null;
}

interface Result {
  id: number;
  total_score: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  created_at: string | null;
  test_id: number | null;
}

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userResults, setUserResults] = useState<Result[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, district, institution, current_streak")
      .then(({ data, error }) => {
        if (error) toast.error("ব্যবহারকারী লোড ব্যর্থ");
        else setProfiles(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = profiles.filter(
    (p) =>
      (!districtFilter || (p.district ?? "").toLowerCase().includes(districtFilter.toLowerCase())) &&
      (!institutionFilter || (p.institution ?? "").toLowerCase().includes(institutionFilter.toLowerCase()))
  );

  const viewPerformance = async (profile: Profile) => {
    setSelectedUser(profile);
    setResultsLoading(true);
    const { data, error } = await supabase
      .from("results")
      .select("id, total_score, correct_count, wrong_count, created_at, test_id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("ফলাফল লোড ব্যর্থ");
    setUserResults(data ?? []);
    setResultsLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h2>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="জেলা দিয়ে খুঁজুন..."
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="প্রতিষ্ঠান দিয়ে খুঁজুন..."
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ছবি</TableHead>
              <TableHead>নাম</TableHead>
              <TableHead>জেলা</TableHead>
              <TableHead>প্রতিষ্ঠান</TableHead>
              <TableHead>স্ট্রিক</TableHead>
              <TableHead>অ্যাকশন</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p.avatar_url ?? ""} />
                    <AvatarFallback>{(p.display_name ?? "?")[0]}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{p.display_name ?? "—"}</TableCell>
                <TableCell>{p.district ?? "—"}</TableCell>
                <TableCell>{p.institution ?? "—"}</TableCell>
                <TableCell>{p.current_streak ?? 0}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => viewPerformance(p)}>
                    <Eye className="h-4 w-4 mr-1" /> পারফরম্যান্স
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedUser?.display_name ?? "User"} — পারফরম্যান্স</DialogTitle>
          </DialogHeader>
          {resultsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : userResults.length === 0 ? (
            <p className="text-muted-foreground">কোনো ফলাফল পাওয়া যায়নি।</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>স্কোর</TableHead>
                  <TableHead>সঠিক</TableHead>
                  <TableHead>ভুল</TableHead>
                  <TableHead>তারিখ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userResults.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.test_id}</TableCell>
                    <TableCell>{r.total_score ?? "—"}</TableCell>
                    <TableCell>{r.correct_count ?? 0}</TableCell>
                    <TableCell>{r.wrong_count ?? 0}</TableCell>
                    <TableCell>{r.created_at ? new Date(r.created_at).toLocaleDateString("bn-BD") : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
