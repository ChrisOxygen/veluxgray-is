import { Suspense } from "react";
import { LeadDetailView } from "@/features/leads/components/LeadDetailView";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense>
      <LeadDetailView id={id} />
    </Suspense>
  );
}
