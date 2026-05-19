"use client";

import { useRouter } from "next/navigation";
import { Settings, LogOut, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { createClient } from "@/shared/lib/supabase/client";

interface NavUserProps {
  user: {
    name: string;
    email: string;
  };
}

export function NavUser({ user }: NavUserProps) {
  const router = useRouter();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <div className="border-t border-primary-hover pt-3 mt-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-primary-hover transition-colors text-left cursor-pointer">
          <Avatar className="h-7 w-7 rounded-lg shrink-0">
            <AvatarFallback className="rounded-lg text-[11px] font-semibold bg-accent text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight min-w-0">
            <span className="truncate text-[13px] font-medium text-primary-foreground">
              {user.name}
            </span>
            <span className="truncate text-[11px] text-primary-foreground/50">
              {user.email}
            </span>
          </div>
          <ChevronUp className="size-3.5 shrink-0 text-primary-foreground/40" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-52 rounded-xl"
          side="top"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <Avatar className="h-7 w-7 rounded-lg shrink-0">
                <AvatarFallback className="rounded-lg text-[11px] font-semibold bg-accent-subtle text-accent-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-[13px] font-medium text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            variant="destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
