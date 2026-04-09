import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  name: string;
  icon: string;
  topicCount: number;
  completionPercent: number;
  className?: string;
}

export function SubjectCard({ name, icon, topicCount, completionPercent, className }: SubjectCardProps) {
  return (
    <Card className={cn("card-shadow hover-scale cursor-pointer transition-shadow hover:card-shadow-hover", className)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight">{name}</h3>
            <p className="text-xs text-muted-foreground">{topicCount}টি টপিক</p>
          </div>
          <span className="text-sm font-bold text-primary">{completionPercent}%</span>
        </div>
        <Progress value={completionPercent} className="h-2" />
      </CardContent>
    </Card>
  );
}
