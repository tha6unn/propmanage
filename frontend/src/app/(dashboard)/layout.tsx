import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "@/components/nav-link";

const ownerNavItems = [
  { iconName: "LayoutDashboard", label: "Portfolio", href: "/portfolio" },
  { iconName: "FileText", label: "Docs", href: "/documents" },
  { iconName: "Users", label: "Tenants", href: "/tenants" },
  { iconName: "CreditCard", label: "Payments", href: "/payments" },
  { iconName: "Bot", label: "Agent", href: "/agent" },
];

const ownerSidebarItems = [
  { iconName: "LayoutDashboard", label: "Portfolio", href: "/portfolio" },
  { iconName: "Building2", label: "Properties", href: "/properties" },
  { iconName: "FileText", label: "Documents", href: "/documents" },
  { iconName: "Users", label: "Tenants", href: "/tenants" },
  { iconName: "CreditCard", label: "Payments", href: "/payments" },
  { iconName: "Wrench", label: "Maintenance", href: "/maintenance" },
  { iconName: "Bot", label: "AI Agent", href: "/agent" },
];

const tenantNavItems = [
  { iconName: "LayoutDashboard", label: "My Home", href: "/my-tenancy" },
  { iconName: "CreditCard", label: "Payments", href: "/payments" },
  { iconName: "Wrench", label: "Maintenance", href: "/maintenance" },
  { iconName: "FileText", label: "Docs", href: "/documents" },
];

const tenantSidebarItems = [
  { iconName: "LayoutDashboard", label: "My Tenancy", href: "/my-tenancy" },
  { iconName: "CreditCard", label: "Payments", href: "/payments" },
  { iconName: "Wrench", label: "Maintenance", href: "/maintenance" },
  { iconName: "FileText", label: "Documents", href: "/documents" },
];

const managerNavItems = [
  { iconName: "Building2", label: "Properties", href: "/assigned-properties" },
  { iconName: "Wrench", label: "Maintenance", href: "/maintenance" },
  { iconName: "FileText", label: "Docs", href: "/documents" },
];

const managerSidebarItems = [
  { iconName: "Building2", label: "Assigned Properties", href: "/assigned-properties" },
  { iconName: "Wrench", label: "Maintenance", href: "/maintenance" },
  { iconName: "FileText", label: "Documents", href: "/documents" },
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
  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Auto-create profile if missing (safety net for users who registered before fix)
  if (!profile) {
    const fallbackName =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fallbackName,
      role: "owner",
    });
    profile = { full_name: fallbackName, role: "owner" };
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const role = profile?.role || "owner";

  const sidebarItems = role === "tenant" ? tenantSidebarItems : role === "manager" ? managerSidebarItems : ownerSidebarItems;
  const navItems = role === "tenant" ? tenantNavItems : role === "manager" ? managerNavItems : ownerNavItems;
  const homeHref = role === "tenant" ? "/my-tenancy" : role === "manager" ? "/assigned-properties" : "/portfolio";

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-100 z-30">
        {/* Logo */}
        <Link href={homeHref} className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 hover:bg-surface/50 transition-colors">
          <div className="w-9 h-9 bg-propblue rounded-xl flex items-center justify-center shadow-glow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[18px] font-bold text-ink">PropManage</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              iconName={item.iconName}
              variant="sidebar"
            />
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-propblue/10 text-propblue rounded-lg flex items-center justify-center text-[11px] font-bold">
                {initials}
              </div>
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
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              iconName={item.iconName}
              variant="mobile"
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
