import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Segmented, Status } from "@/components/kit";
import { threads } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Outbound" },
      { name: "description", content: "Every reply across email, SMS, WhatsApp and calls in one inbox." },
      { property: "og:title", content: "Inbox — Outbound" },
      { property: "og:description", content: "Every reply across email, SMS, WhatsApp and calls in one inbox." },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [sel, setSel] = useState(threads[0].id);
  const list = threads.filter((t) => filter === "all" || t.unread);
  const t = threads.find((x) => x.id === sel)!;

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-3.5rem)] md:-mx-8 md:-my-8">
      <aside className={cn("flex w-full flex-col border-r border-border bg-card md:w-[340px]", sel && "hidden md:flex")}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-sm font-semibold">Inbox</h1>
          <Segmented value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "unread", label: "Unread" }]} />
        </div>
        <ul className="flex-1 divide-y divide-border overflow-y-auto">
          {list.map((m) => (
            <li key={m.id}>
              <button onClick={() => setSel(m.id)} className={cn("w-full px-4 py-3 text-left hover:bg-accent", sel === m.id && "bg-accent")}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("truncate text-sm", m.unread && "font-semibold")}>{m.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{m.time}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{m.preview}</div>
                <div className="mt-2 flex gap-1.5 text-[11px] text-muted-foreground"><span>{m.channel}</span><span>·</span><span>{m.intent}</span></div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className={cn("flex min-w-0 flex-1 flex-col", !sel && "hidden md:flex")}>
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
          <div className="min-w-0">
            <button className="mb-1 text-xs text-muted-foreground md:hidden" onClick={() => setSel("")}>Back</button>
            <div className="truncate text-sm font-semibold">{t?.name}</div>
            <div className="text-xs text-muted-foreground">{t?.channel} · Q4 outreach — Dentists</div>
          </div>
          <div className="flex gap-2">
            <Status tone={t?.intent === "Interested" ? "success" : t?.intent === "Unsubscribe" ? "danger" : "info"}>{t?.intent}</Status>
            <Button size="sm" variant="outline" className="hidden sm:inline-flex">Move to stage</Button>
          </div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto bg-background px-4 py-6 md:px-6">
          <div className="max-w-lg rounded-lg border border-border bg-card p-3 text-sm">
            Hi, I noticed your practice doesn't have a website yet. I put together a quick mockup — worth a 10 minute look?
            <div className="mt-2 text-[11px] text-muted-foreground">You · Oct 17, 11:00</div>
          </div>
          <div className="ml-auto max-w-lg rounded-lg bg-primary p-3 text-sm text-primary-foreground">
            {t?.preview}
            <div className="mt-2 text-[11px] opacity-70">{t?.name} · {t?.time}</div>
          </div>
        </div>
        <footer className="border-t border-border bg-card p-4 md:px-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>AI suggested reply</span>
            <button className="hover:text-foreground">Regenerate</button>
          </div>
          <Textarea rows={3} defaultValue="Great to hear. Does Tuesday at 10am or Wednesday at 2pm work for a quick call? I'll walk you through the mockup and pricing." />
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" variant="outline">Schedule</Button>
            <Button size="sm">Send</Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
