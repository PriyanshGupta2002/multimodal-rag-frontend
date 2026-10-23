import { WorkspacePage } from "@/app/features/workspace/components/workspace-page";
import { Suspense } from "react";

export default function ChatThreadPage() {
  return (
    <Suspense
      fallback={<main className="h-[100dvh] animate-pulse bg-background" />}
    >
      <WorkspacePage />
    </Suspense>
  );
}
