"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { ShellHeader } from "./ShellHeader";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex lg:h-screen bg-background p-3 gap-3">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — dark graphite card */}
      <aside
        className={[
          "fixed lg:relative z-30 lg:z-auto inset-y-0 left-0",
          "w-56 shrink-0 flex flex-col bg-primary rounded-2xl",
          "transition-transform duration-200 ease-in-out",
          sidebarOpen
            ? "translate-x-0 m-3"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <DashboardSidebar user={user} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-3">
        <ShellHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto rounded-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
