"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChartNoAxesCombined,
  ChevronRight,
  File,
  FileText,
  Image as ImageIcon,
  Layers3,
  LogOut,
  MessageSquareText,
  Monitor,
  MoreHorizontal,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Table2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser } from "@/app/features/auth/hooks/use-current-user";
import { useLogout } from "@/app/features/auth/hooks/use-logout";
import { DiagramEvidence, TableEvidence } from "@/app/features/workspace/components/multimodal-evidence";

const examples = [
  {
    modality: "image",
    question: "What does this architecture diagram show?",
    answer:
      "It shows three stages: incoming files are parsed, their text and visual content are indexed, then retrieved together to answer a question with page-level evidence.",
    source: "System architecture.pdf",
    detail: "Page 4 · Multimodal retrieval flow",
  },
  {
    modality: "table",
    question: "Which quarter had the highest revenue?",
    answer:
      "Q4 had the highest revenue at $2.4M, up $0.6M from Q1. The table shows steady quarter-over-quarter growth.",
    source: "Quarterly performance.pdf",
    detail: "Page 7 · Revenue by quarter",
  },
  {
    modality: "text",
    question: "What are the renewal terms?",
    answer:
      "The agreement renews automatically for one-year periods. Either party can stop renewal with 60 days’ written notice before the current term ends.",
    source: "Vendor agreement.pdf",
    detail: "Page 8 · Term and renewal",
  },
];

const documents = [
  { name: "System architecture.pdf", pages: "12 pages", type: "pdf" },
  { name: "Quarterly performance.pdf", pages: "16 pages", type: "pdf" },
  { name: "Vendor agreement.pdf", pages: "18 pages", type: "pdf" },
];

export default function HomePage() {
  const router = useRouter();
  const { setTheme, resolvedTheme, theme } = useTheme();
  const [activeExample, setActiveExample] = useState(0);
  const [showSources, setShowSources] = useState(true);
  const [typedCharacters, setTypedCharacters] = useState(0);
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not check your sign-in session.");
      }
      return (await response.json()) as { authenticated: boolean };
    },
    retry: false,
    staleTime: 30_000,
  });
  const isSignedIn = sessionQuery.data?.authenticated === true;
  const currentUserQuery = useCurrentUser(isSignedIn);
  const logoutMutation = useLogout();
  const example = examples[activeExample];
  const displayedAnswer = example.answer.slice(0, typedCharacters);
  const isTyping = typedCharacters < example.answer.length;

  function selectExample(index: number) {
    setTypedCharacters(0);
    setActiveExample(index);
    setShowSources(true);
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const timeout = window.setTimeout(
        () => setTypedCharacters(example.answer.length),
        0,
      );
      return () => window.clearTimeout(timeout);
    }

    let characterCount = 0;
    const typingInterval = window.setInterval(() => {
      characterCount += 1;
      setTypedCharacters(characterCount);

      if (characterCount >= example.answer.length) {
        window.clearInterval(typingInterval);
      }
    }, 18);

    return () => window.clearInterval(typingInterval);
  }, [activeExample, example.answer]);

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      router.refresh();
      await sessionQuery.refetch();
    } catch {
      router.replace("/sign-in");
    }
  }

  function getUserInitials(name: string): string {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toLocaleUpperCase() || "?"
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Layers3 className="size-[18px]" />
            </span>
            <span>RAG Workspace</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#documents" className="transition-colors hover:text-foreground">
              For your documents
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {sessionQuery.isPending ? (
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            ) : isSignedIn ? (
              <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={
                          currentUserQuery.data
                            ? `Account menu for ${currentUserQuery.data.name}`
                            : "Account menu"
                        }
                        className="size-9 rounded-full p-0"
                      />
                    }
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {currentUserQuery.data
                        ? getUserInitials(currentUserQuery.data.name)
                        : <MoreHorizontal className="size-4" />}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {currentUserQuery.data
                          ? getUserInitials(currentUserQuery.data.name)
                          : "…"}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {currentUserQuery.data?.name ??
                            (currentUserQuery.isError ? "Account unavailable" : "Loading account")}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {currentUserQuery.data?.email ??
                            (currentUserQuery.isError ? "Could not load profile" : " ")}
                        </span>
                      </span>
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard")}
                      className="h-10 rounded-lg px-3"
                    >
                      <Layers3 className="size-4" />
                      Open workspace
                      <ArrowRight className="ml-auto size-4" />
                    </DropdownMenuItem>
                    <div className="px-3 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Appearance
                    </div>
                    <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/60 p-1">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => {
                        const activeTheme =
                          value === "system" ? theme === "system" : resolvedTheme === value && theme !== "system";

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setTheme(value)}
                            aria-pressed={activeTheme}
                            className={`flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] transition-colors ${
                              activeTheme
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className="size-3.5" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => void handleLogout()}
                      disabled={logoutMutation.isPending}
                      className="h-10 rounded-lg px-3"
                    >
                      <LogOut className="size-4" />
                      {logoutMutation.isPending ? "Signing out…" : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : sessionQuery.isError ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void sessionQuery.refetch()}
              >
                Retry
              </Button>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/sign-in"
                  className="hidden px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Create account <ArrowUpRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Multimodal RAG for the files you actually have
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl">
            Ask about the{" "}
            <span className="text-primary">whole page.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
            Not just extracted text. Ask about diagrams, images, charts, and
            tables inside your PDFs. Get a clear answer with the relevant visual
            or data evidence surfaced from its page.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { icon: ImageIcon, label: "Images & diagrams" },
              { icon: Table2, label: "Tables & figures" },
              { icon: ShieldCheck, label: "Page-level sources" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {isSignedIn ? "Open your workspace" : "Create your workspace"}{" "}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Explore the workflow <ArrowDown className="size-4" />
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="size-4 text-primary" />
            Choose a source, inspect a citation, and stay in control.
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 bg-muted/70" />
          <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-lg">
            <div className="flex h-12 items-center justify-between border-b bg-muted/40 px-4">
              <div className="flex min-w-0 items-center gap-2 text-xs">
                <Layers3 className="size-4 shrink-0 text-primary" />
                <span className="truncate font-medium">Product research</span>
                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground">Ask your documents</span>
              </div>
              <span className="ml-2 flex shrink-0 items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium text-secondary-foreground">
                {example.modality === "image" ? (
                  <ImageIcon className="size-3" />
                ) : example.modality === "table" ? (
                  <Table2 className="size-3" />
                ) : (
                  <FileText className="size-3" />
                )}
                {example.modality === "image"
                  ? "Visual evidence"
                  : example.modality === "table"
                    ? "Table evidence"
                    : "Text evidence"}
              </span>
            </div>

            <div className="grid min-h-[380px] md:grid-cols-[0.76fr_1.24fr]">
              <aside className="hidden border-r bg-muted/20 p-4 md:block">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-medium">Documents</span>
                  <button
                    type="button"
                    aria-label="Add documents"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="size-3.5" />
                  </button>
                </div>
                <div className="mb-3 flex items-center gap-2 rounded-md border bg-background px-2.5 py-2 text-xs text-muted-foreground">
                  <Search className="size-3.5" />
                  Find a document
                </div>
                <div className="space-y-1">
                  {documents.map((document, index) => (
                    <button
                      key={document.name}
                      type="button"
                      onClick={() => selectExample(index)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors ${
                        example.source === document.name
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      }`}
                    >
                      {document.type === "pdf" ? (
                        <FileText className="size-4 shrink-0 text-primary" />
                      ) : (
                        <File className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                        {document.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {document.pages.split(" ")[0]}p
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <MessageSquareText className="size-3.5 text-muted-foreground" />
                    Recent question
                  </div>
                  <p className="mt-2 line-clamp-2 pl-5 text-[11px] leading-5 text-muted-foreground">
                    {example.question}
                  </p>
                </div>
              </aside>

              <div className="flex min-w-0 flex-col p-4 sm:p-5">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium">Conversation</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Ask across your project documents
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSources((current) => !current)}
                    aria-pressed={showSources}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] transition-colors ${
                      showSources
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                    Sources {showSources ? "on" : "off"}
                  </button>
                </div>

                <div className="mb-3 ml-auto max-w-[90%] rounded-md bg-primary px-3.5 py-2.5 text-xs leading-5 text-primary-foreground">
                  {example.question}
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
                    <Sparkles className="size-3.5 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex h-4 items-center gap-1.5 text-[9px] text-muted-foreground">
                      <span className="relative flex size-1.5">
                        {isTyping && (
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                        )}
                        <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                      </span>
                      {isTyping
                        ? `Reading ${example.modality === "image" ? "figure" : example.modality === "table" ? "table" : "page"} evidence`
                        : `Answer ready · finding source evidence`}
                    </div>
                    <p
                      className="min-h-12 text-xs leading-6 text-card-foreground"
                      aria-label={example.answer}
                    >
                      {displayedAnswer}
                      {isTyping && (
                        <span
                          aria-hidden="true"
                          className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-primary"
                        />
                      )}
                    </p>
                    {example.modality === "image" && showSources && !isTyping && (
                      <div className="source-emerge">
                        <DiagramEvidence />
                      </div>
                    )}
                    {example.modality === "table" && showSources && !isTyping && (
                      <div className="source-emerge">
                        <TableEvidence />
                      </div>
                    )}
                    {showSources && !isTyping && (
                      <button
                        type="button"
                        onClick={() => setShowSources(false)}
                        className="source-emerge source-emerge-delayed mt-3 flex max-w-full items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 text-left transition-colors hover:bg-accent"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background">
                          <FileText className="size-3.5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-medium">
                            {example.source}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-muted-foreground">
                            {example.detail}
                          </span>
                        </span>
                        <span className="shrink-0 rounded bg-background px-1.5 py-1 text-[9px] font-medium text-muted-foreground">
                          {example.modality === "image"
                            ? "FIGURE"
                            : example.modality === "table"
                              ? "TABLE"
                              : "TEXT"}
                        </span>
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {examples.map((item, index) => (
                      <button
                        key={item.question}
                        type="button"
                        onClick={() => selectExample(index)}
                        className={`rounded-md border px-2.5 py-1.5 text-[10px] transition-colors ${
                          activeExample === index
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {item.question}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2.5">
                    <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                      Ask something about these files…
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        selectExample((activeExample + 1) % examples.length)
                      }
                      aria-label="Try another sample question"
                      className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="size-3.5 text-primary" />
                Grounded in the documents you choose
              </span>
              <span className="hidden sm:inline">Select a question to explore</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
            icon: ImageIcon,
            title: "Understand visual pages",
            description: "Ask about diagrams, figures, and images in your PDFs",
            },
            {
            icon: Table2,
            title: "Get answers from tables",
            description: "Surface relevant rows and values, not just nearby prose",
            },
            {
              icon: ShieldCheck,
            title: "Verify the evidence",
            description: "Trace answers back to the cited page and source",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md border bg-card text-primary">
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-xs font-medium">{title}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {description}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-24"
      >
        <div className="max-w-md">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-primary">
            More than text search
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
            The answer can be in the picture, the table, or the fine print.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Multimodal retrieval brings relevant text and visual evidence from
            your PDFs into one answer. Ask naturally, then inspect the page that
            supports it.
          </p>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {isSignedIn ? "Continue to your workspace" : "Start with your documents"}{" "}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div id="documents" className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Upload,
              step: "01 · Read beyond paragraphs",
              title: "Ask about figures and diagrams",
              text: "Understand what a diagram or image in a PDF is showing, then see the matching visual source.",
            },
            {
              icon: Table2,
              step: "02 · Make tables useful",
              title: "Find the row that answers",
              text: "Ask a question about tabular data and bring the relevant values into the response.",
            },
            {
              icon: ChartNoAxesCombined,
              step: "03 · Connect the evidence",
              title: "Answer across modalities",
              text: "Use the context around a visual or table together with the document text to answer in context.",
            },
            {
              icon: ShieldCheck,
              step: "04 · Keep it verifiable",
              title: "Go straight to the source",
              text: "Each answer can point back to its document and page so you can inspect the original evidence.",
            },
          ].map(({ icon: Icon, step, title, text }) => (
            <article
              key={step}
              className="rounded-lg border bg-card p-5 transition-colors hover:bg-accent/40"
            >
              <div className="mb-7 flex size-9 items-center justify-center rounded-md border bg-muted text-primary">
                <Icon className="size-4" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {step}
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl border bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] opacity-80">
              Make room for better questions
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Your next useful answer might already be in a file.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 opacity-85">
              Bring it into a workspace that helps you find it — and shows you
              exactly where it came from.
            </p>
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary-foreground px-4 text-sm font-medium text-primary transition-opacity hover:opacity-90"
            >
              {isSignedIn ? "Open your workspace" : "Create your workspace"}{" "}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
            <Layers3 className="size-4 text-primary" />
            RAG Workspace
          </Link>
          <span>Answers grounded in the documents that matter to you.</span>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            {isSignedIn ? "Open workspace" : "Sign in"} <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
