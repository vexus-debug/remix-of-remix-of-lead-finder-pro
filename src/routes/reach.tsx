import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, Metric, MetricGrid, Page, PageHeader, Panel, Status } from "@/components/kit";
import { domains, sequences } from "@/lib/mock";

export const Route = createFileRoute("/reach")({
  head: () => ({
    meta: [
      { title: "Reach — Outbound" },
      { name: "description", content: "Email, SMS and WhatsApp sequences with A/B testing and sending health." },
      { property: "og:title", content: "Reach — Outbound" },
      { property: "og:description", content: "Email, SMS and WhatsApp sequences with A/B testing and sending health." },
    ],
  }),
  component: ReachPage,
});

const steps = [
  { day: 0, ch: "Email", subj: "Quick idea for {{business_name}}", ab: true },
  { day: 2, ch: "Email", subj: "Re: Quick idea for {{business_name}}", ab: false },
  { day: 4, ch: "SMS", subj: "Hi {{first_name}}, did you see my note?", ab: false },
  { day: 7, ch: "WhatsApp", subj: "Last check-in + a free mockup", ab: false },
];

function ReachPage() {
  const [spam, setSpam] = useState<null | number>(null);
  return (
    <Page wide>
      <PageHeader
        eyebrow="Leads"
        title="Reach"
        description="Multi-step outreach across email, SMS and WhatsApp. Messages are personalised per lead."
        actions={<Button size="sm">New sequence</Button>}
      />
      <MetricGrid cols={4}>
        <Metric label="Sent (30d)" value="1,175" delta={18} />
        <Metric label="Open rate" value="48.2%" delta={3.1} />
        <Metric label="Reply rate" value="8.6%" delta={1.4} />
        <Metric label="Bounce rate" value="0.9%" delta={-0.3} />
      </MetricGrid>

      <Tabs defaultValue="sequences">
        <TabsList>
          <TabsTrigger value="sequences">Sequences</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="sending">Sending</TabsTrigger>
          <TabsTrigger value="suppression">Do-not-contact</TabsTrigger>
        </TabsList>

        <TabsContent value="sequences" className="mt-4">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead><TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Open</TableHead><TableHead className="text-right">Reply</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sequences.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}<div className="text-xs font-normal text-muted-foreground">{s.steps} steps</div></TableCell>
                    <TableCell>{s.channel}</TableCell>
                    <TableCell><Status tone={s.status === "Active" ? "success" : s.status === "Paused" ? "warning" : "neutral"}>{s.status}</Status></TableCell>
                    <TableCell className="num text-right">{s.enrolled}</TableCell>
                    <TableCell className="num text-right">{s.sent}</TableCell>
                    <TableCell className="num text-right">{s.open ? `${s.open}%` : "—"}</TableCell>
                    <TableCell className="num text-right">{s.reply}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="num grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-xs">{i + 1}</div>
                    {i < steps.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="mb-3 flex-1 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Day <span className="num">{s.day}</span> · {s.ch}</span>
                      {s.ab && <span className="rounded border border-border px-1.5 py-0.5">A/B test</span>}
                    </div>
                    <div className="mt-1.5 text-sm font-medium">{s.subj}</div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="ml-11">Add step</Button>
            </div>
            <Panel title="Compose step 1" description="Variables: business_name, first_name, city">
              <div className="space-y-3">
                <Input defaultValue="Quick idea for {{business_name}}" />
                <Textarea rows={7} defaultValue={"Hi {{first_name}},\n\nI noticed {{business_name}} doesn't have a website yet. Patients in {{city}} search online first — I put together a quick mockup.\n\nWorth a 10 minute look?"} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">Personalise with AI</Button>
                  <Button size="sm" variant="outline" onClick={() => setSpam(92)}>Check spam score</Button>
                </div>
                {spam !== null && (
                  <div className="rounded-md border border-border p-3 text-sm">
                    <div className="flex justify-between"><span>Deliverability score</span><span className="num">{spam}/100</span></div>
                    <div className="mt-2"><Bar value={spam} /></div>
                    <p className="mt-2 text-xs text-muted-foreground">No spam trigger words. One link. Plain-text friendly.</p>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="sending" className="mt-4 space-y-4">
          <Panel title="Sending domains" actions={<Button size="sm" variant="outline">Connect domain</Button>} bodyClassName="p-0">
            <div className="divide-y divide-border">
              {domains.map((d) => (
                <div key={d.domain} className="grid items-center gap-3 px-4 py-3 md:grid-cols-[1fr_120px_200px_100px]">
                  <div className="font-mono text-sm">{d.domain}</div>
                  <Status tone={d.status === "Verified" ? "success" : "warning"}>{d.status}</Status>
                  <div><div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Warm-up</span><span className="num">{d.warmup}%</span></div><Bar value={d.warmup} /></div>
                  <div className="num text-right text-sm">{d.daily}/day</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Protection">
            <div className="space-y-4 text-sm">
              {[["Pause on bounce above 3%", true], ["Stop sequence when lead replies", true], ["Add unsubscribe link to every email", true], ["Send only on business days", false]].map(([l, v]) => (
                <label key={l as string} className="flex items-center justify-between">{l}<Switch defaultChecked={v as boolean} /></label>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="suppression" className="mt-4">
          <Panel title="Do-not-contact list" description="These contacts will never receive any message." actions={<Button size="sm" variant="outline">Import CSV</Button>} bodyClassName="p-0">
            <div className="divide-y divide-border text-sm">
              {[["info@lekkifamily.ng", "Unsubscribed", "Oct 19"], ["+234 805 000 1111", "Requested by phone", "Oct 12"], ["bounce@oldclinic.com", "Hard bounce", "Oct 02"]].map(([a, r, d]) => (
                <div key={a} className="flex items-center justify-between px-4 py-3"><span className="font-mono">{a}</span><span className="text-muted-foreground">{r} · {d}</span></div>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
