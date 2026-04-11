import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function AdminUsers() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");

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
                  <Button size="sm" variant="outline" onClick={() => navigate(`/admin/users/${p.id}`)}>
                    <Eye className="h-4 w-4 mr-1" /> বিস্তারিত
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
