import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Page, PageHeader, Segmented, Tag } from "@/components/kit";
import { deals as seed, stages, timeline, type Stage } from "@/lib/mock";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline — Outbound" },
      { name: "description", content: "Move leads through stages, track deal value and log every touchpoint." },
      { property: "og:title", content: "Pipeline — Outbound" },
      { property: "og:description", content: "Move leads through stages, track deal value and log every touchpoint." },
    ],
  }),
  component: PipelinePage,
});

function PipelinePage() {
  const [deals, setDeals] = useState(seed);
  const [dragId, setDragId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [view, setView] = useState<"board" | "segments">("board");
  const open = deals.find((d) => d.id === openId);

  const move = (stage: Stage) => {
    if (!dragId) return;
    setDeals((ds) => ds.map((d) => (d.id === dragId ? { ...d, stage } : d)));
    setDragId(null);
  };

  return (
    <Page wide>
      <PageHeader
        eyebrow="Leads"
        title="Pipeline"
        description="Drag cards between stages. Click a card to see notes, tasks and the full activity timeline."
        actions={
          <>
            <Segmented value={view} onChange={setView} options={[{ value: "board", label: "Board" }, { value: "segments", label: "Segments" }]} />
            <Button variant="outline" size="sm">Merge duplicates</Button>
            <Button size="sm">Add deal</Button>
          </>
        }
      />

      {view === "board" ? (
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="grid min-w-[1000px] grid-cols-5 gap-3">
            {stages.map((stage) => {
              const col = deals.filter((d) => d.stage === stage);
              const total = col.reduce((a, d) => a + d.value, 0);
              return (
                <div
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => move(stage)}
                  className="flex min-h-[60vh] flex-col rounded-lg border border-border bg-muted/50"
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {stage}
                      <span className="num text-xs text-muted-foreground">{col.length}</span>
                    </div>
                    <span className="num text-xs text-muted-foreground">${total.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                    {col.map((d) => (
                      <button
                        key={d.id}
                        draggable
                        onDragStart={() => setDragId(d.id)}
                        onClick={() => setOpenId(d.id)}
                        className="rounded-md border border-border bg-card p-3 text-left shadow-[0_1px_0_0_var(--border)] transition-colors hover:border-foreground/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium leading-snug">{d.name}</span>
                          <span className="num shrink-0 text-xs text-muted-foreground">{d.score}</span>
                        </div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">{d.contact}</div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-1">{d.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
                          <span className="num text-xs">${d.value.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { n: "Hot — score above 80", c: 3, r: "score > 80" },
            { n: "No website, has phone", c: 128, r: "website is empty AND phone exists" },
            { n: "Replied, no deal", c: 14, r: "replied = true AND stage = Contacted" },
          ].map((s) => (
            <div key={s.n} className="rounded-lg border border-border bg-card p-4">
              <div className="flex justify-between text-sm font-medium">{s.n}<span className="num">{s.c}</span></div>
              <code className="mt-2 block rounded bg-muted px-2 py-1.5 font-mono text-xs text-muted-foreground">{s.r}</code>
            </div>
          ))}
        </div>
      )}

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{open.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{open.contact}</p>
              </SheetHeader>
              <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border text-sm">
                {[["Stage", open.stage], ["Deal value", `$${open.value.toLocaleString()}`], ["Lead score", String(open.score)]].map(([k, v]) => (
                  <div key={k} className="bg-card p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="num mt-1">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline">Log call</Button>
                <Button size="sm" variant="outline">Send email</Button>
                <Button size="sm" variant="outline">Add task</Button>
              </div>
              <Tabs defaultValue="activity" className="mt-6">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                </TabsList>
                <TabsContent value="activity">
                  <ol className="relative mt-3 space-y-5 border-l border-border pl-5">
                    {timeline.map((t) => (
                      <li key={t.when} className="relative">
                        <span className="absolute -left-[23px] top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
                        <div className="text-sm font-medium">{t.what}</div>
                        <div className="text-xs text-muted-foreground">{t.when}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
                <TabsContent value="notes" className="space-y-2">
                  <Textarea placeholder="Write a note…" rows={4} />
                  <Button size="sm">Save note</Button>
                </TabsContent>
                <TabsContent value="fields" className="space-y-3">
                  {["Practice size", "Current website", "Decision maker"].map((f) => (
                    <label key={f} className="block text-xs text-muted-foreground">{f}<Input className="mt-1" /></label>
                  ))}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
