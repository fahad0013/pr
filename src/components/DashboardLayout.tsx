import { ReactNode } from "react";
import { DashboardTopNav } from "./DashboardTopNav";
import { DashboardBottomNav } from "./DashboardBottomNav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardTopNav />
      <main className="pb-20 md:pb-0">{children}</main>
      <DashboardBottomNav />
    </div>
  );
}
