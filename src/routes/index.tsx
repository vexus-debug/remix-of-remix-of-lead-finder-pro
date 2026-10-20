import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getStats } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { Metric, MetricGrid, Page, PageHeader, Panel, Status } from "@/components/kit";
import { ledger, onboarding, sequences, threads, wallet } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Outbound" },
      { name: "description", content: "Your leads, outreach, creative and credit activity at a glance." },
      { property: "og:title", content: "Overview — Outbound" },
      { property: "og:description", content: "Your leads, outreach, creative and credit activity at a glance." },
    ],
  }),
  component: Overview,
});

const activity = Array.from({ length: 14 }, (_, i) => ({
  d: `Oct ${7 + i}`,
  leads: [42, 38, 61, 55, 70, 48, 30, 66, 81, 74, 90, 62, 88, 104][i],
  replies: [3, 2, 5, 4, 6, 3, 2, 7, 6, 8, 9, 5, 10, 12][i],
}));

type Range = "7" | "14";

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <div className="mb-1 text-muted-foreground">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 capitalize"><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.dataKey}</span>
          <span className="num font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Overview() {
  const fn = useServerFn(getStats);
  const { data } = useQuery({ queryKey: ["stats"], queryFn: () => fn(), refetchInterval: 15000 });
  const s = data ?? { totalLeads: 0, newToday: 0, scanned: 0, duplicates: 0, withWebsite: 0, apiUsed: 0, apiRemaining: 50, apiLimit: 50 };
  const done = onboarding.filter((o) => o.done).length;
  const [range, setRange] = useState<Range>("14");
  const series = range === "7" ? activity.slice(-7) : activity;

  return (
    <Page wide>
      <PageHeader
        title="Good morning, Chidi"
        description="Here is what moved across your workspace recently."
        actions={
          <>
            <Button variant="outline" size="sm" className="press" asChild><Link to="/studio/ads">New ad</Link></Button>
            <Button size="sm" className="press" asChild><Link to="/search">Find leads</Link></Button>
          </>
        }
      />

      <MetricGrid cols={5}>
        <Metric label="Total leads" value={s.totalLeads.toLocaleString()} hint={`${s.newToday} today`} />
        <Metric label="Pipeline value" value="$21,400" delta={12} />
        <Metric label="Reply rate" value="8.6%" delta={1.4} />
        <Metric label="Credits left" value={wallet.balance.toLocaleString()} hint="Auto top-up on" />
        <Metric label="Search quota" value={`${s.apiRemaining}/${s.apiLimit}`} hint="this hour" />
      </MetricGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Activity"
          description="Leads collected and replies received"
          actions={<Segmented value={range} onChange={setRange} options={[{ value: "7", label: "7D" }, { value: "14", label: "14D" }]} />}
        >
          <div className="mb-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-chart-1" />Leads</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-chart-2" />Replies</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: -24, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Line type="monotone" dataKey="leads" stroke="var(--chart-1)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} animationDuration={600} />
                <Line type="monotone" dataKey="replies" stroke="var(--chart-2)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} animationDuration={600} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Get set up" description={`${done} of ${onboarding.length} complete`} bodyClassName="px-2 pb-2">
          <div className="mx-3 mb-2 h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground transition-[width] duration-700" style={{ width: `${(done / onboarding.length) * 100}%` }} />
          </div>
          <ul>
            {onboarding.map((o) => (
              <li key={o.label} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-muted/60">
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${o.done ? "border-foreground bg-foreground" : "border-input"}`}>
                  {o.done && (
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-background"><path d="M2 5.2 4.1 7.2 8 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
                <span className={o.done ? "text-muted-foreground" : ""}>{o.label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Sequences" actions={<Link to="/reach" className="text-xs text-muted-foreground hover:text-foreground">View all</Link>} bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {sequences.slice(0, 3).map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm">{q.name}</div>
                  <div className="text-xs text-muted-foreground">{q.channel} · <span className="num">{q.enrolled}</span> enrolled</div>
                </div>
                <span className="num text-sm">{q.reply}%</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Latest replies" actions={<Link to="/inbox" className="text-xs text-muted-foreground hover:text-foreground">Open inbox</Link>} bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {threads.slice(0, 3).map((t) => (
              <li key={t.id} className="px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                </div>
                <div className="truncate text-xs text-muted-foreground">{t.preview}</div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Credit usage" actions={<Link to="/billing" className="text-xs text-muted-foreground hover:text-foreground">Ledger</Link>} bodyClassName="p-0">
          <ul className="divide-y divide-border">
            {ledger.slice(0, 4).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm">{l.desc}</div>
                  <div className="text-xs text-muted-foreground">{l.date}</div>
                </div>
                <span className={`num text-sm ${l.amount > 0 ? "text-success" : ""}`}>{l.amount > 0 ? "+" : ""}{l.amount}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Status tone="success">All systems normal</Status>
        <span>Search, sending and AI services are available.</span>
      </div>
    </Page>
  );
}
