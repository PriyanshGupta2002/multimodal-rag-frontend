import { Suspense } from "react";
import { WorkspacePage } from "../features/workspace/components/workspace-page";

export default function DashboardPage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspacePage />
    </Suspense>
  );
}

function WorkspaceLoading() {
  return (
    <main className="flex h-[100dvh] overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 border-r bg-muted/20 sm:block">
        <div className="h-16 animate-pulse border-b bg-muted/40" />
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="h-16 animate-pulse border-b bg-muted/40" />
        <div className="flex-1 animate-pulse bg-background" />
        <div className="h-36 animate-pulse border-t bg-muted/20" />
      </section>
    </main>
  );
}
