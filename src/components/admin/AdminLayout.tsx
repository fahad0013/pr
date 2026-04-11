import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  BarChart3,
  Database,
  Trophy,
  Bell,
  Settings,
  Sun,
  Moon,
  Ellipsis,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const navItems = [
  { title: "ড্যাশবোর্ড", url: "/admin", icon: LayoutDashboard },
  { title: "ব্যবহারকারী", url: "/admin/users", icon: Users },
  { title: "পরীক্ষা", url: "/admin/tests", icon: FileText },
  { title: "প্রশ্ন", url: "/admin/questions", icon: HelpCircle },
  { title: "অ্যানালিটিক্স", url: "/admin/analytics", icon: BarChart3 },
  { title: "লিডারবোর্ড", url: "/admin/leaderboard", icon: Trophy },
  { title: "নোটিফিকেশন", url: "/admin/notifications", icon: Bell },
  { title: "সেটিংস", url: "/admin/settings", icon: Settings },
  { title: "সিড ডেটা", url: "/seed", icon: Database },
];

// Bottom nav shows first 4 items + "More" sheet for the rest
const bottomNavItems = navItems.slice(0, 4);
const moreNavItems = navItems.slice(4);

function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();

  if (isMobile) return null; // Mobile uses bottom nav instead

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-base">
            {!collapsed && "প্রস্তুতি Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminBottomNav() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (url: string) => {
    if (url === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(url);
  };

  const isMoreActive = moreNavItems.some((item) => isActive(item.url));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {bottomNavItems.map((item) => {
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/admin"}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors text-muted-foreground"
              activeClassName="text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.title}</span>
            </NavLink>
          );
        })}

        {/* More button with sheet */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors ${
                isMoreActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Ellipsis className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">আরও</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8">
            <SheetTitle className="text-base font-semibold mb-4">আরও অপশন</SheetTitle>
            <div className="grid grid-cols-4 gap-4">
              {moreNavItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                    activeClassName=""
                    onClick={() => setMoreOpen(false)}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium text-center leading-tight">{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

function AdminHeader() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <header className="h-14 flex items-center border-b border-border px-4 gap-3 sticky top-0 z-30 bg-background">
      {!isMobile && <SidebarTrigger />}
      <h1 className="text-base md:text-lg font-semibold text-foreground truncate">
        {isMobile ? "প্রস্তুতি Admin" : "Admin Panel"}
      </h1>
      <div className="ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}

export function AdminLayout() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className={`flex-1 p-3 md:p-6 overflow-auto ${isMobile ? "pb-20" : ""}`}>
            <Outlet />
          </main>
        </div>
        {isMobile && <AdminBottomNav />}
      </div>
    </SidebarProvider>
  );
}
