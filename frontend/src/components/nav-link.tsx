"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Bot,
  Building2,
  Wrench,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Bot,
  Building2,
  Wrench,
};

interface NavLinkProps {
  href: string;
  label: string;
  iconName: string;
  variant?: "sidebar" | "mobile";
}

export function NavLink({ href, label, iconName, variant = "sidebar" }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const Icon = iconMap[iconName] || LayoutDashboard;

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center py-1.5 px-3 transition-colors ${
          isActive
            ? "text-propblue"
            : "text-ink-light hover:text-propblue"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group ${
        isActive
          ? "bg-propblue-light text-propblue font-semibold"
          : "text-ink-medium hover:bg-propblue-light hover:text-propblue"
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span className="font-medium">{label}</span>
      <ChevronRight
        className={`w-3.5 h-3.5 ml-auto transition-opacity ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
    </Link>
  );
}
