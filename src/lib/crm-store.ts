// Client-side CRM state (pipeline, sequences, inbox, lead activity) until the backend is wired.
// Persisted to localStorage; server render uses the seed snapshot.
import { useSyncExternalStore } from "react";
import { deals as seedDeals, sequences as seedSeqs, threads as seedThreads, stages, type Stage } from "./mock";
import type { LeadRow } from "./export";

export type Activity = { id: string; when: string; what: string; detail?: string };
export type Task = { id: string; title: string; done: boolean };
export type Deal = {
  id: string;
  name: string;
  contact: string;
  value: number;
  stage: Stage | "Lost";
  score: number;
  tags: string[];
  owner: string;
  last: string;
  leadId?: string;
  notes: string[];
  tasks: Task[];
  activity: Activity[];
  fields: Record<string, string>;
};
export type Step = { id: string; day: number; ch: "Email" | "SMS" | "WhatsApp"; subj: string; body: string; ab: boolean };
export type Sequence = {
  id: string;
  name: string;
  channel: string;
  status: "Active" | "Paused" | "Draft" | "Archived";
  enrolled: number;
  sent: number;
  open: number;
  reply: number;
  steps: Step[];
  leadIds: string[];
};
export type Message = { id: string; from: "me" | "them"; text: string; at: string };
export type Thread = (typeof seedThreads)[number] & { messages: Message[]; stage?: Stage | "Lost" };
export type LocalLead = LeadRow & { id: string; local: true };
export type LeadMeta = { notes: string[]; activity: Activity[] };

type State = {
  deals: Deal[];
  sequences: Sequence[];
  threads: Thread[];
  suppression: { value: string; reason: string; date: string }[];
  localLeads: LocalLead[];
  leadMeta: Record<string, LeadMeta>;
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const nowLabel = () =>
  new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const defaultBody =
  "Hi {{first_name}},\n\nI noticed {{business_name}} doesn't have a website yet. Customers in {{city}} search online first — I put together a quick mockup you can see in 2 minutes.\n\nWorth a look?";

const seed: State = {
  deals: seedDeals.map((d) => ({
    ...d,
    notes: [],
    tasks: [],
    fields: {},
    activity: [
      { id: uid(), when: "Oct 16, 08:30", what: "Deal created", detail: "From search results" },
    ],
  })),
  sequences: seedSeqs.map((s) => ({
    ...s,
    status: s.status as Sequence["status"],
    leadIds: [],
    steps: [
      { id: uid(), day: 0, ch: "Email", subj: "Quick idea for {{business_name}}", body: defaultBody, ab: true },
      { id: uid(), day: 2, ch: "Email", subj: "Re: Quick idea for {{business_name}}", body: "Hi {{first_name}}, just bumping this up — happy to share the mockup.", ab: false },
      { id: uid(), day: 4, ch: "SMS", subj: "Hi {{first_name}}, did you see my note?", body: "Hi {{first_name}}, did you see my note about {{business_name}}?", ab: false },
      { id: uid(), day: 7, ch: "WhatsApp", subj: "Last check-in + a free mockup", body: "Last check-in — I'll leave the free mockup with you.", ab: false },
    ].slice(0, s.steps) as Step[],
  })),
  threads: seedThreads.map((t) => ({
    ...t,
    messages: [
      { id: uid(), from: "me", text: "Hi, I noticed your business doesn't have a website yet. I put together a quick mockup — worth a 10 minute look?", at: "Oct 17, 11:00" },
      { id: uid(), from: "them", text: t.preview, at: t.time },
    ],
  })),
  suppression: [
    { value: "info@lekkifamily.ng", reason: "Unsubscribed", date: "Oct 19" },
    { value: "+234 805 000 1111", reason: "Requested by phone", date: "Oct 12" },
    { value: "bounce@oldclinic.com", reason: "Hard bounce", date: "Oct 02" },
  ],
  localLeads: [],
  leadMeta: {},
};

const KEY = "crm-store-v1";
let state: State = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...seed, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

export function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useCrm<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return sel(state);
    },
    () => sel(seed),
  );
}

// ---- actions ----
export const allStages = [...stages, "Lost"] as const;

export function addDeal(d: Partial<Deal> & { name: string }) {
  const deal: Deal = {
    id: uid(),
    contact: "",
    value: 0,
    stage: "New",
    score: 50,
    tags: [],
    owner: "You",
    last: "now",
    notes: [],
    tasks: [],
    fields: {},
    activity: [{ id: uid(), when: nowLabel(), what: "Deal created" }],
    ...d,
  };
  setState((s) => ({ ...s, deals: [deal, ...s.deals] }));
  return deal;
}

export function updateDeal(id: string, fn: (d: Deal) => Deal) {
  setState((s) => ({ ...s, deals: s.deals.map((d) => (d.id === id ? fn(d) : d)) }));
}

export function logDeal(id: string, what: string, detail?: string) {
  updateDeal(id, (d) => ({ ...d, last: "now", activity: [{ id: uid(), when: nowLabel(), what, detail }, ...d.activity] }));
}

export function logLead(leadId: string, what: string, detail?: string) {
  setState((s) => {
    const m = s.leadMeta[leadId] ?? { notes: [], activity: [] };
    return { ...s, leadMeta: { ...s.leadMeta, [leadId]: { ...m, activity: [{ id: uid(), when: nowLabel(), what, detail }, ...m.activity] } } };
  });
}

export function addLeadNote(leadId: string, note: string) {
  setState((s) => {
    const m = s.leadMeta[leadId] ?? { notes: [], activity: [] };
    return { ...s, leadMeta: { ...s.leadMeta, [leadId]: { ...m, notes: [note, ...m.notes] } } };
  });
  logLead(leadId, "Note added", note);
}

export function addLeadsToPipeline(leads: (LeadRow & { id: string })[]) {
  let added = 0;
  setState((s) => {
    const existing = new Set(s.deals.map((d) => d.leadId).filter(Boolean));
    const fresh: Deal[] = leads
      .filter((l) => !existing.has(l.id))
      .map((l) => ({
        id: uid(),
        leadId: l.id,
        name: l.business_name,
        contact: l.email ?? l.phone ?? "",
        value: 1500,
        stage: "New",
        score: Math.round(40 + (l.rating ?? 3) * 10),
        tags: [l.category ?? "lead", ...(l.website ? [] : ["no site"])].slice(0, 2).map((t) => t.toLowerCase()),
        owner: "You",
        last: "now",
        notes: [],
        tasks: [],
        fields: {},
        activity: [{ id: uid(), when: nowLabel(), what: "Added to pipeline", detail: "From Contacts" }],
      }));
    added = fresh.length;
    return { ...s, deals: [...fresh, ...s.deals] };
  });
  leads.forEach((l) => logLead(l.id, "Added to pipeline"));
  return added;
}

export function enrollLeads(seqId: string, leadIds: string[]) {
  let added = 0;
  setState((s) => ({
    ...s,
    sequences: s.sequences.map((q) => {
      if (q.id !== seqId) return q;
      const set = new Set(q.leadIds);
      const fresh = leadIds.filter((id) => !set.has(id));
      added = fresh.length;
      return { ...q, leadIds: [...q.leadIds, ...fresh], enrolled: q.enrolled + fresh.length };
    }),
  }));
  const name = state.sequences.find((q) => q.id === seqId)?.name;
  leadIds.forEach((id) => logLead(id, "Enrolled in sequence", name));
  return added;
}

export function updateSequence(id: string, fn: (q: Sequence) => Sequence) {
  setState((s) => ({ ...s, sequences: s.sequences.map((q) => (q.id === id ? fn(q) : q)) }));
}

export function addSequence(name: string, channel: Step["ch"]) {
  const q: Sequence = {
    id: uid(),
    name,
    channel,
    status: "Draft",
    enrolled: 0,
    sent: 0,
    open: 0,
    reply: 0,
    leadIds: [],
    steps: [{ id: uid(), day: 0, ch: channel, subj: "Quick idea for {{business_name}}", body: defaultBody, ab: false }],
  };
  setState((s) => ({ ...s, sequences: [q, ...s.sequences] }));
  return q;
}

export function updateThread(id: string, fn: (t: Thread) => Thread) {
  setState((s) => ({ ...s, threads: s.threads.map((t) => (t.id === id ? fn(t) : t)) }));
}

export function addLocalLead(l: Omit<LeadRow, "created_at"> & Partial<Pick<LeadRow, "created_at">>) {
  const lead: LocalLead = { created_at: new Date().toISOString(), ...l, id: `local-${uid()}`, local: true };
  setState((s) => ({ ...s, localLeads: [lead, ...s.localLeads] }));
  return lead;
}

export function removeLocalLeads(ids: string[]) {
  const set = new Set(ids);
  setState((s) => ({ ...s, localLeads: s.localLeads.filter((l) => !set.has(l.id)) }));
}

export function addSuppression(values: string[], reason: string) {
  const date = new Date().toLocaleDateString(undefined, { month: "short", day: "2-digit" });
  setState((s) => ({ ...s, suppression: [...values.map((value) => ({ value, reason, date })), ...s.suppression] }));
}

/** Minimal CSV parser (handles quoted fields). */
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur = "", row: string[] = [], q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); rows.push(row); row = []; cur = "";
    } else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()));
  if (!head) return [];
  const keys = head.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}
