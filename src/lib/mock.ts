// Sample data used by UI screens that are not yet connected to the backend.
export const workspaces = [
  { id: "w1", name: "Dental Lounge", plan: "Growth" },
  { id: "w2", name: "Northside Agency", plan: "Starter" },
];

export const wallet = { balance: 2450, monthlyUsed: 1830, autoTopUp: true, threshold: 500 };

export const creditCosts = [
  { action: "Lead search (per lead)", cost: 1 },
  { action: "Email enrichment", cost: 2 },
  { action: "Email verification", cost: 1 },
  { action: "SMS sent", cost: 3 },
  { action: "WhatsApp message", cost: 4 },
  { action: "AI ad copy (5 variants)", cost: 5 },
  { action: "AI image", cost: 10 },
  { action: "AI video (30s)", cost: 120 },
];

export const packs = [
  { credits: 1000, price: 19, label: "Starter" },
  { credits: 5000, price: 79, label: "Growth", popular: true },
  { credits: 20000, price: 249, label: "Scale" },
];

export const ledger = [
  { id: "t1", date: "Oct 20, 09:12", desc: "Lead search — Dentists, Lagos", amount: -48, by: "You" },
  { id: "t2", date: "Oct 19, 17:40", desc: "Email sequence — Q4 outreach (step 2)", amount: -126, by: "Ada O." },
  { id: "t3", date: "Oct 19, 11:03", desc: "Top-up — Growth pack", amount: 5000, by: "You" },
  { id: "t4", date: "Oct 18, 15:22", desc: "AI ad copy — Teeth whitening promo", amount: -15, by: "Tunde B." },
  { id: "t5", date: "Oct 18, 09:01", desc: "Email verification — 210 contacts", amount: -210, by: "You" },
  { id: "t6", date: "Oct 17, 13:44", desc: "Promo code WELCOME200", amount: 200, by: "System" },
];

export const invoices = [
  { id: "INV-1042", date: "Oct 19, 2026", amount: 79, status: "Paid" },
  { id: "INV-1031", date: "Sep 28, 2026", amount: 79, status: "Paid" },
  { id: "INV-1019", date: "Sep 02, 2026", amount: 19, status: "Paid" },
];

export const stages = ["New", "Contacted", "Qualified", "Proposal", "Won"] as const;
export type Stage = (typeof stages)[number];

export const deals: { id: string; name: string; contact: string; value: number; stage: Stage; score: number; tags: string[]; owner: string; last: string }[] = [
  { id: "d1", name: "Smile Studio Ikeja", contact: "+234 803 555 0192", value: 1200, stage: "New", score: 72, tags: ["dentist"], owner: "AO", last: "2h" },
  { id: "d2", name: "Brightway Dental", contact: "info@brightway.ng", value: 2400, stage: "New", score: 58, tags: ["dentist", "no site"], owner: "TB", last: "5h" },
  { id: "d3", name: "Lekki Family Clinic", contact: "+234 809 111 2233", value: 3800, stage: "Contacted", score: 81, tags: ["clinic"], owner: "AO", last: "1d" },
  { id: "d4", name: "Pearl Orthodontics", contact: "hello@pearlortho.com", value: 5200, stage: "Contacted", score: 66, tags: ["ortho"], owner: "You", last: "1d" },
  { id: "d5", name: "Victoria Island Dental", contact: "+234 802 444 9988", value: 4100, stage: "Qualified", score: 88, tags: ["dentist"], owner: "TB", last: "3d" },
  { id: "d6", name: "Ajah Smile Centre", contact: "ajah.smile@gmail.com", value: 1800, stage: "Proposal", score: 91, tags: ["dentist", "hot"], owner: "You", last: "4h" },
  { id: "d7", name: "Yaba Dental Care", contact: "+234 701 222 3344", value: 2900, stage: "Won", score: 95, tags: ["dentist"], owner: "AO", last: "6d" },
];

export const timeline = [
  { when: "Today, 09:40", what: "Replied to email", detail: "\"Yes, we'd like to see the proposal next week.\"" },
  { when: "Yesterday, 16:12", what: "Call logged — 4m 12s", detail: "Spoke with practice manager. Interested in new site + booking." },
  { when: "Oct 17, 11:00", what: "Sequence step 1 sent", detail: "Q4 outreach — Intro email" },
  { when: "Oct 16, 08:30", what: "Lead created", detail: "From search: Dentists in Lekki" },
];

export const sequences = [
  { id: "s1", name: "Q4 outreach — Dentists", channel: "Email", status: "Active", enrolled: 312, sent: 841, open: 48.2, reply: 7.4, steps: 4 },
  { id: "s2", name: "No-website follow-up", channel: "SMS", status: "Active", enrolled: 120, sent: 236, open: 0, reply: 11.8, steps: 3 },
  { id: "s3", name: "Clinic reactivation", channel: "WhatsApp", status: "Paused", enrolled: 64, sent: 98, open: 0, reply: 14.2, steps: 2 },
  { id: "s4", name: "Webinar invite", channel: "Email", status: "Draft", enrolled: 0, sent: 0, open: 0, reply: 0, steps: 5 },
];

export const domains = [
  { domain: "mail.dentallounge.ng", status: "Verified", warmup: 82, health: "Good", daily: 120 },
  { domain: "outreach.dentallounge.ng", status: "Warming", warmup: 36, health: "Good", daily: 40 },
];

export const threads = [
  { id: "m1", name: "Ajah Smile Centre", channel: "Email", preview: "Yes, we'd like to see the proposal next week.", time: "09:40", unread: true, intent: "Interested" },
  { id: "m2", name: "Brightway Dental", channel: "SMS", preview: "Who is this? How did you get my number?", time: "08:15", unread: true, intent: "Question" },
  { id: "m3", name: "Pearl Orthodontics", channel: "WhatsApp", preview: "Can you send pricing for a 5 page site?", time: "Yesterday", unread: false, intent: "Interested" },
  { id: "m4", name: "Lekki Family Clinic", channel: "Email", preview: "Please remove me from your list.", time: "Yesterday", unread: false, intent: "Unsubscribe" },
  { id: "m5", name: "Missed call +234 803 555 0192", channel: "Call", preview: "Auto text-back sent: \"Sorry we missed you…\"", time: "Mon", unread: false, intent: "Missed call" },
];

export const assets = [
  { id: "a1", name: "Whitening promo — Variant A", type: "Ad", format: "1080×1080", status: "Approved", version: 3, updated: "2h ago" },
  { id: "a2", name: "Whitening promo — Variant B", type: "Ad", format: "1080×1080", status: "In review", version: 1, updated: "2h ago" },
  { id: "a3", name: "Patient testimonial cut", type: "Video", format: "9:16 · 0:28", status: "Draft", version: 2, updated: "1d ago" },
  { id: "a4", name: "October carousel — Myths", type: "Carousel", format: "5 slides", status: "Approved", version: 1, updated: "3d ago" },
  { id: "a5", name: "YouTube thumbnail — Braces", type: "Image", format: "1280×720", status: "Changes requested", version: 4, updated: "4d ago" },
];

export const sites = [
  { id: "p1", name: "Dental Lounge — Home", domain: "dentallounge.ng", status: "Live", visits: 4210, conv: 3.8, updated: "Oct 18" },
  { id: "p2", name: "Whitening offer", domain: "offer.dentallounge.ng", status: "Live", visits: 1290, conv: 7.1, updated: "Oct 15" },
  { id: "p3", name: "Invisalign consult", domain: "Not connected", status: "Draft", visits: 0, conv: 0, updated: "Oct 12" },
];

export const team = [
  { name: "Chidi Okafor", email: "chidi@dentallounge.ng", role: "Owner", status: "Active", twofa: true, last: "Now" },
  { name: "Ada Obi", email: "ada@dentallounge.ng", role: "Admin", status: "Active", twofa: true, last: "1h ago" },
  { name: "Tunde Bello", email: "tunde@dentallounge.ng", role: "Member", status: "Active", twofa: false, last: "Yesterday" },
  { name: "sam@agency.co", email: "sam@agency.co", role: "Member", status: "Invited", twofa: false, last: "—" },
];

export const audit = [
  { when: "09:12", who: "Chidi Okafor", what: "Ran lead search", target: "Dentists, Lagos" },
  { when: "08:50", who: "Ada Obi", what: "Changed role", target: "Tunde Bello → Member" },
  { when: "Yesterday", who: "Chidi Okafor", what: "Created API key", target: "zapier-prod" },
  { when: "Yesterday", who: "System", what: "Auto top-up", target: "5,000 credits" },
];

export const onboarding = [
  { label: "Run your first lead search", done: true },
  { label: "Connect a sending domain", done: true },
  { label: "Set up your brand kit", done: false },
  { label: "Launch your first sequence", done: false },
  { label: "Publish a landing page", done: false },
];
