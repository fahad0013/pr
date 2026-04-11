import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Setting {
  key: string;
  value: boolean;
  label: string;
  description: string;
}

const SETTINGS_CONFIG: { key: string; label: string; description: string }[] = [
  { key: "maintenance_mode", label: "রক্ষণাবেক্ষণ মোড", description: "সাইটটি সাময়িকভাবে বন্ধ রাখুন।" },
  { key: "signups_enabled", label: "নতুন রেজিস্ট্রেশন চালু", description: "নতুন ব্যবহারকারী রেজিস্ট্রেশন করতে পারবে।" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("platform_settings").select("key, value");
    if (error) { toast.error("সেটিংস লোড ব্যর্থ"); setLoading(false); return; }

    const map = new Map((data ?? []).map(d => [d.key, d.value]));
    setSettings(
      SETTINGS_CONFIG.map(c => ({
        ...c,
        value: map.get(c.key) === true || map.get(c.key) === "true",
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (key: string, current: boolean) => {
    const newVal = !current;
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value: newVal as any, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) toast.error("আপডেট ব্যর্থ");
    else {
      toast.success("সেটিং আপডেট হয়েছে");
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newVal } : s));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">প্ল্যাটফর্ম সেটিংস</h2>

      <Card>
        <CardHeader><CardTitle>কনফিগারেশন</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            settings.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-base">{s.label}</Label>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
                <Switch checked={s.value} onCheckedChange={() => toggle(s.key, s.value)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
