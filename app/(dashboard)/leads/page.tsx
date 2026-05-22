import { Suspense } from "react";
import { LeadsView } from "@/features/leads/components/LeadsView";

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsView />
    </Suspense>
  );
}
