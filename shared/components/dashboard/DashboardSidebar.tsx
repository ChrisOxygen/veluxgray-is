"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users2, BarChart3, BadgeCheck } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Overview" },
  { href: "/products", icon: Package, label: "Products" },
  { href: "/leads", icon: Users2, label: "Leads" },
  { href: "/sales", icon: BadgeCheck, label: "Sales" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
] as const;

export interface DashboardSidebarProps {
  user: {
    name: string;
    email: string;
  };
  onClose?: () => void;
}

export function DashboardSidebar({ user, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: isActive(item.href),
  }));

  return (
    <div className="flex flex-col h-full py-4 px-3">
      {/* Brand */}
      <Link
        href="/"
        onClick={onClose}
        className="flex items-center gap-3 px-2 py-2 mb-6 rounded-xl hover:bg-primary-hover transition-colors"
      >
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-accent shrink-0">
          <span className="text-[13px] font-bold text-accent-foreground tracking-tight">VG</span>
        </div>
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-primary-foreground">
            Velux Gray
          </span>
          <span className="truncate text-[11px] text-primary-foreground/45">
            Operations
          </span>
        </div>
      </Link>

      {/* Section label */}
      <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/30">
        Menu
      </p>

      {/* Nav */}
      <div className="flex-1">
        <NavMain items={navItems} onClose={onClose} />
      </div>

      {/* User */}
      <NavUser user={user} />
    </div>
  );
}
