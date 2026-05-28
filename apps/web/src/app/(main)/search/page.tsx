import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/index";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div>
      <PageHeader title="Search Songs" subtitle="Find any song by name" />
      <div className="px-5">
        <EmptyState emoji="🔍" title="Song search" description="Implemented in Session 6" />
      </div>
    </div>
  );
}
