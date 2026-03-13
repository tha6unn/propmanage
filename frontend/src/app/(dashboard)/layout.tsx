import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Bot,
  Building2,
  Wrench,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { icon: LayoutDashboard, label: "Portfolio", href: "/portfolio" },
  { icon: FileText, label: "Docs", href: "/documents" },
  { icon: Users, label: "Tenants", href: "/tenants" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Bot, label: "Agent", href: "/agent" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Portfolio", href: "/portfolio" },
  { icon: Building2, label: "Properties", href: "/properties" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: Users, label: "Tenants", href: "/tenants" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: Wrench, label: "Maintenance", href: "/maintenance" },
  { icon: Bot, label: "AI Agent", href: "/agent" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const role = profile?.role || "owner";

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-propblue rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[18px] font-bold text-ink">PropManage</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-medium hover:bg-propblue-light hover:text-propblue transition-colors group"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-propblue/10 text-propblue rounded-lg flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-ink-light capitalize">{role}</p>
            </div>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-ink-light hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-propblue rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-ink">PropManage</span>
            </div>
            <div className="w-7 h-7 bg-propblue/10 text-propblue rounded-lg flex items-center justify-center text-[11px] font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-4 lg:px-8 py-4 lg:py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-20">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-1.5 px-3 text-ink-light hover:text-propblue transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
