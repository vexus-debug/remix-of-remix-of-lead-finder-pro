import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const RATE_LIMIT = 50;

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(25_000) });
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function getAdmin() {
  return import("@/integrations/supabase/client.server").then((m) => m.supabaseAdmin);
}

async function countRequestsLastHour(supabase: Awaited<ReturnType<typeof getAdmin>>) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("api_requests")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);
  return count ?? 0;
}

export const getRateLimit = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getAdmin();
  const used = await countRequestsLastHour(supabase);
  return { used, remaining: Math.max(0, RATE_LIMIT - used), limit: RATE_LIMIT };
});

export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getAdmin();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalLeads, todayLeads, totals, rate, withWebsite] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
    supabase.from("searches").select("scanned, saved, duplicates"),
    countRequestsLastHour(await getAdmin()),
    supabase.from("leads").select("*", { count: "exact", head: true }).not("website", "is", null),
  ]);

  const scanned = (totals.data ?? []).reduce((a, r) => a + (r.scanned ?? 0), 0);
  const duplicates = (totals.data ?? []).reduce((a, r) => a + (r.duplicates ?? 0), 0);

  return {
    totalLeads: totalLeads.count ?? 0,
    newToday: todayLeads.count ?? 0,
    scanned,
    duplicates,
    withWebsite: withWebsite.count ?? 0,
    apiUsed: rate,
    apiRemaining: Math.max(0, RATE_LIMIT - rate),
    apiLimit: RATE_LIMIT,
  };
});

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getAdmin();
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listSearches = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getAdmin();
  const { data, error } = await supabase.from("searches").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const deleteLeads = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ ids: z.array(z.string()).min(1) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = await getAdmin();
    const { error } = await supabase.from("leads").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    return { deleted: data.ids.length };
  });

type MapsResult = {
  title?: string;
  place_id?: string;
  data_id?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  gps_coordinates?: { latitude?: number; longitude?: number };
  type?: string;
  types?: string[];
  permanently_closed?: boolean;
  sponsored?: boolean;
  ad?: boolean;
  place_id_search?: string;
  provider_id?: string;
  link?: string;
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EMAIL_BLACKLIST = /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg|@sentry|@example\.|@2x\.|u003e|wixpress|godaddy|squarespace|wordpress)/i;

function extractEmails(html: string): string[] {
  const found = new Set<string>();
  const mailto = html.matchAll(/mailto:([^"'?>\s]+)/gi);
  for (const m of mailto) {
    const e = decodeURIComponent(m[1]).trim().toLowerCase();
    if (EMAIL_REGEX.test(e) && !EMAIL_BLACKLIST.test(e)) found.add(e);
  }
  const plain = html.match(EMAIL_REGEX) ?? [];
  for (const raw of plain) {
    const e = raw.toLowerCase();
    if (!EMAIL_BLACKLIST.test(e)) found.add(e);
  }
  return Array.from(found).slice(0, 3);
}

async function scrapeEmailsFromWebsite(website: string): Promise<string | null> {
  const base = website.startsWith("http") ? website : `https://${website}`;
  const candidates = [base, `${base.replace(/\/$/, "")}/contact`];
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8_000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadFinder/1.0)" },
        redirect: "follow",
      });
      if (!res.ok) continue;
      const html = await res.text();
      const emails = extractEmails(html);
      if (emails.length > 0) return emails[0];
    } catch {
      // site unreachable — try next candidate
    }
  }
  return null;
}

// Web-search fallback for businesses without a website (or where the site
// shows no email): searches the web for the business name + address and
// extracts any published email from the result excerpts.
async function findEmailViaWebSearch(name: string, address: string): Promise<string | null> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const parallelKey = process.env["PARALLEL_API_KEY"];
  if (!lovableKey || !parallelKey) return null;
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/parallel/v1/search", {
      method: "POST",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": parallelKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        objective: `Find the public contact email address of the business "${name}" located at ${address}`,
        search_queries: [`${name} ${address} email`, `${name} contact email`],
        mode: "fast",
        advanced_settings: { max_results: 5 },
      }),
    });
    if (!res.ok) {
      console.error(`Parallel search failed [${res.status}]: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const json = (await res.json()) as { results?: Array<{ excerpts?: string[]; title?: string }> };
    const text = (json.results ?? []).flatMap((r) => r.excerpts ?? []).join("\n");
    const emails = extractEmails(text);
    return emails[0] ?? null;
  } catch (e) {
    console.error("Parallel email lookup failed", e);
    return null;
  }
}

export const findLeads = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        category: z.string().trim().min(1).max(120),
        location: z.string().trim().min(1).max(160),
        maxLeads: z.number().int().min(1).max(500),
        mode: z.enum(["all", "emails", "phones"]).default("all"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    let saved = 0;
    let duplicates = 0;
    let scanned = 0;
    let requestsMade = 0;
    let hitRateLimit = false;
    let hitEnd = false;

    try {
    const key = process.env["SERPAPI_KEY"];
    if (!key) {
      return {
        saved: 0,
        duplicates: 0,
        scanned: 0,
        requestsMade: 0,
        hitRateLimit: false,
        hitEnd: false,
        error: "The search service is not configured. Please try again after it has been configured.",
      };
    }
    const supabase = await getAdmin();

    const q = `${data.category} in ${data.location}`;
    const seen = new Set<string>();
    let start = 0;
    let webLookups = 0;
    const WEB_LOOKUP_CAP = 15;
    let serviceError: string | null = null;

    while (saved < data.maxLeads) {
      const used = await countRequestsLastHour(supabase);
      if (used >= RATE_LIMIT) {
        hitRateLimit = true;
        break;
      }
      await supabase.from("api_requests").insert({});
      requestsMade++;

      const url = new URL("https://serpapi.com/search.json");
      url.searchParams.set("engine", "google_maps");
      url.searchParams.set("type", "search");
      url.searchParams.set("q", q);
      url.searchParams.set("start", String(start));
      url.searchParams.set("api_key", key);

      let res: Response;
      try {
        res = await fetchWithRetry(url.toString());
      } catch (e) {
        console.error("SerpAPI request failed after retries", e);
        serviceError = "The map search service is temporarily unreachable. Your saved leads are safe; please try again in a moment.";
        break;
      }
      if (!res.ok) {
        const text = await res.text();
        console.error(`SerpAPI returned ${res.status}: ${text.slice(0, 500)}`);
        serviceError = res.status === 429
          ? "The map search service has reached its request limit. Please try again later."
          : res.status === 401 || res.status === 403
            ? "The map search service rejected the access key. It looks invalid or expired — please update it."
            : "The map search service could not complete this search. Please try again in a moment.";
        break;
      }
      let json: { local_results?: MapsResult[]; error?: string };
      try {
        json = (await res.json()) as { local_results?: MapsResult[]; error?: string };
      } catch (e) {
        console.error("SerpAPI returned an invalid response", e);
        serviceError = "The map search service returned an invalid response. Please try again in a moment.";
        break;
      }
      if (json.error) {
        console.error(`SerpAPI response error: ${json.error}`);
        serviceError = "The map search service rejected this search. Check the search terms and try again.";
        break;
      }
      const results = json.local_results ?? [];
      if (results.length === 0) {
        hitEnd = true;
        break;
      }
      scanned += results.length;

      for (const r of results) {
        if (saved >= data.maxLeads) break;
        if (r.sponsored || r.ad) continue;
        if (r.permanently_closed) continue;
        if (!r.title || !r.address) continue;
        if (data.mode === "phones" && !r.phone) continue;

        let email: string | null = null;
        if (data.mode !== "phones" && r.website) {
          email = await scrapeEmailsFromWebsite(r.website);
        }
        // No website (or site showed no email): search the web for a
        // published email, capped per search to control lookup costs.
        if (data.mode !== "phones" && !email && webLookups < WEB_LOOKUP_CAP) {
          webLookups++;
          email = await findEmailViaWebSearch(r.title, r.address);
        }
        if (data.mode === "emails" && !email) continue;

        const placeId = r.place_id ?? r.data_id ?? null;
        const lat = r.gps_coordinates?.latitude ?? null;
        const lng = r.gps_coordinates?.longitude ?? null;

        // Duplicate detection (within this run)
        const keys = [
          placeId ? `p:${placeId}` : null,
          `n:${r.title.trim().toLowerCase()}|${r.address.trim().toLowerCase()}`,
        ].filter(Boolean) as string[];
        if (keys.some((k) => seen.has(k))) {
          duplicates++;
          continue;
        }

        let existing: { id: string } | null = null;
        if (placeId) {
          const { data: byPlace } = await supabase.from("leads").select("id").eq("place_id", placeId).maybeSingle();
          if (byPlace) existing = byPlace;
        }
        if (!existing) {
          const { data: byNameAddr } = await supabase
            .from("leads")
            .select("id")
            .ilike("business_name", r.title)
            .ilike("address", r.address)
            .maybeSingle();
          if (byNameAddr) existing = byNameAddr;
        }
        if (!existing && lat != null && lng != null) {
          const { data: byGeo } = await supabase
            .from("leads")
            .select("id")
            .ilike("business_name", r.title)
            .eq("latitude", lat)
            .eq("longitude", lng)
            .maybeSingle();
          if (byGeo) existing = byGeo;
        }
        if (existing) {
          duplicates++;
          continue;
        }

        const { error: insErr } = await supabase.from("leads").insert({
          business_name: r.title,
          category: r.type ?? (r.types?.[0] ?? data.category),
          address: r.address,
          phone: r.phone ?? null,
          email,
          website: r.website ?? null,
          rating: r.rating ?? null,
          reviews: r.reviews ?? null,
          maps_link: r.link ?? null,
          place_id: placeId,
          latitude: lat,
          longitude: lng,
          search_category: data.category,
          search_location: data.location,
        });
        if (insErr) {
          if (insErr.code === "23505") duplicates++;
          else throw new Error(insErr.message);
        } else {
          saved++;
          keys.forEach((k) => seen.add(k));
        }
      }

      start += 20;
      if (results.length < 20) {
        hitEnd = true;
        break;
      }
    }

    await supabase.from("searches").insert({
      query: data.category,
      location: data.location,
      scanned,
      saved,
      duplicates,
    });

    return { saved, duplicates, scanned, requestsMade, hitRateLimit, hitEnd, error: serviceError };
    } catch (error) {
      console.error("Lead search failed", error);
      return {
        saved,
        duplicates,
        scanned,
        requestsMade,
        hitRateLimit,
        hitEnd,
        error: "The search service is temporarily unavailable. Your saved leads are safe; please try again in a moment.",
      };
    }
  });