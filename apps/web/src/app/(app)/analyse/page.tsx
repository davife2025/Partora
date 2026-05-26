import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analyse" };

export default function AnalysePage() {
  return (
    <div>
      <PageHeader title="Type Lyrics" subtitle="Enter lyrics and choose a key" />
      <div className="px-5">
        <EmptyState
          emoji="✍️"
          title="Lyrics analysis"
          description="Full input form implemented in Session 4"
          action={<Link href="/"><Button variant="secondary" size="sm">Back home</Button></Link>}
        />
      </div>
    </div>
  );
}
