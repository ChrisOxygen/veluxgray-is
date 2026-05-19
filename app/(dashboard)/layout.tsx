import { redirect } from "next/navigation";
import { createClient } from "@/shared/lib/supabase/server";
import { DashboardShell } from "@/shared/components/dashboard/DashboardShell";

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
    redirect("/sign-in");
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "Owner";

  return (
    <DashboardShell user={{ name: displayName, email: user.email ?? "" }}>
      {children}
    </DashboardShell>
  );
}
