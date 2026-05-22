import { Suspense } from "react";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardView />
    </Suspense>
  );
}
