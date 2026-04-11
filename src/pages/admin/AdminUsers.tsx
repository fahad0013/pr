import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Flame, MapPin, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
      <h2 className="text-xl md:text-2xl font-bold">ব্যবহারকারী ব্যবস্থাপনা</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="জেলা দিয়ে খুঁজুন..."
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Input
          placeholder="প্রতিষ্ঠান দিয়ে খুঁজুন..."
          value={institutionFilter}
          onChange={(e) => setInstitutionFilter(e.target.value)}
          className="w-full sm:max-w-xs"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isMobile ? (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate(`/admin/users/${p.id}`)}>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={p.avatar_url ?? ""} />
                  <AvatarFallback>{(p.display_name ?? "?")[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.display_name ?? "—"}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                    {p.district && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.district}</span>}
                    {p.institution && <span className="flex items-center gap-1 truncate"><Building2 className="h-3 w-3" />{p.institution}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Flame className="h-3 w-3" />{p.current_streak ?? 0}
                  </Badge>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
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
        </div>
      )}
    </div>
  );
}
