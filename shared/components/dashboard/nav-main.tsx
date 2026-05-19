"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
}

interface NavMainProps {
  items: NavItem[];
  onClose?: () => void;
}

export function NavMain({ items, onClose }: NavMainProps) {
  return (
    <nav className="space-y-0.5">
      {items.map(({ href, label, icon: Icon, isActive }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className={[
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-primary-foreground/60 hover:bg-primary-hover hover:text-primary-foreground",
          ].join(" ")}
        >
          <Icon size={15} strokeWidth={isActive ? 2.2 : 1.7} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
