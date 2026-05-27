import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/index";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Record" };

export default function RecordPage() {
  return (
    <div>
      <PageHeader title="Record Live" subtitle="Hum or sing a snippet" />
      <div className="px-5">
        <EmptyState emoji="🎤" title="Live recording" description="Implemented in Session 7" />
      </div>
    </div>
  );
}
