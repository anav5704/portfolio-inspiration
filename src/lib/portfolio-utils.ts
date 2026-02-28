// ---- Known compound TLDs ----
export const KNOWN_COMPOUND_TLDS = new Set([
  "is-a.dev",
  "is-cool.dev",
  "is-savvy.dev",
  "github.io",
  "vercel.app",
  "netlify.app",
  "web.app",
  "pages.dev",
  "onrender.com",
  "framer.website",
  "framer.ai",
  "streamlit.app",
  "firebaseapp.com",
  "amplifyapp.com",
  "webflow.io",
  "now.sh",
  "duckdns.org",
  "pythonanywhere.com",
  "js.org",
  "com.np",
  "com.br",
  "com.mx",
  "com.tr",
  "co.uk",
  "co.in",
  "io.vn",
  "id.au",
  "pp.ua",
  "my.id",
]);

// ---- Top TLDs shown in the dropdown (everything else = "other") ----
export const TOP_TLDS = [
  "com",
  "vercel.app",
  "github.io",
  "dev",
  "netlify.app",
  "me",
  "in",
  "tech",
  "io",
  "xyz",
  "site",
  "net",
  "fr",
] as const;

export const TOP_TLDS_SET = new Set<string>(TOP_TLDS);

// ---- Role categories ----
export const ROLE_CATEGORIES: { value: string; label: string }[] = [
  { value: "fullstack", label: "Full Stack Developer" },
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "ai-ml", label: "AI / ML Engineer" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "mobile", label: "Mobile Developer" },
  { value: "data", label: "Data Engineer" },
  { value: "design", label: "Designer / UX Engineer" },
  { value: "gamedev", label: "Game Developer" },
  { value: "security", label: "Security Engineer" },
  { value: "student", label: "Student Developer" },
  { value: "freelance", label: "Freelance Developer" },
  { value: "other-role", label: "Other Role" },
  { value: "unknown", label: "Not Specified" },
];

// ---- Derive TLD from domain ----
export function getTld(domain: string): string {
  for (const compound of KNOWN_COMPOUND_TLDS) {
    if (domain.endsWith("." + compound)) return compound;
  }
  const parts = domain.split(".");
  return parts[parts.length - 1];
}

// ---- Map free-text role string to a category key ----
export function getRoleCategory(role: string | null): string {
  if (!role) return "unknown";
  const r = role.toLowerCase();
  if (/full.?stack/.test(r)) return "fullstack";
  if (/front.?end|frontend/.test(r)) return "frontend";
  if (/back.?end|backend/.test(r)) return "backend";
  if (/\bai\b|machine learning|\bml\b/.test(r)) return "ai-ml";
  if (/devops|sre|infrastructure|cloud/.test(r)) return "devops";
  if (/mobile|ios|android|flutter|react native/.test(r)) return "mobile";
  if (/data\s*(scien|analy|engin)/.test(r)) return "data";
  if (/design|ux|ui/.test(r)) return "design";
  if (/game/.test(r)) return "gamedev";
  if (/security|cyber/.test(r)) return "security";
  if (/student/.test(r)) return "student";
  if (/freelance/.test(r)) return "freelance";
  return "other-role";
}

// ---- Enriched entry used across all pages ----
export interface Entry {
  domain: string;
  name: string;
  role: string | null;
  tld: string;
  roleCategory: string;
}

// ---- Given raw collection data, produce enriched entries ----
export function enrichEntries(
  portfolios: { data: { domain: string; name: string; role: string | null } }[],
): Entry[] {
  return portfolios.map((p) => ({
    domain: p.data.domain,
    name: p.data.name,
    role: p.data.role,
    tld: getTld(p.data.domain),
    roleCategory: getRoleCategory(p.data.role),
  }));
}

// ---- Compute TLD dropdown chips ----
export interface TldChip {
  tld: string;
  count: number;
}

export function computeTldChips(entries: Entry[]): {
  chips: TldChip[];
  otherCount: number;
} {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.tld] = (counts[e.tld] || 0) + 1;
  }

  const chips: TldChip[] = TOP_TLDS.filter((t) => counts[t]).map((t) => ({
    tld: t,
    count: counts[t],
  }));

  const topTotal = chips.reduce((s, c) => s + c.count, 0);
  const otherCount = entries.length - topTotal;

  return { chips, otherCount };
}

// ---- Compute role category dropdown chips ----
export interface RoleChip {
  value: string;
  label: string;
  count: number;
}

export function computeRoleChips(entries: Entry[]): RoleChip[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.roleCategory] = (counts[e.roleCategory] || 0) + 1;
  }

  return ROLE_CATEGORIES.filter((c) => counts[c.value]).map((c) => ({
    ...c,
    count: counts[c.value],
  }));
}

// ---- Compute ALL unique TLDs with counts (for the landing page) ----
export function computeAllTldCounts(
  entries: Entry[],
): { tld: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.tld] = (counts[e.tld] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([tld, count]) => ({ tld, count }))
    .sort((a, b) => b.count - a.count);
}

// ---- Get role label by category value ----
export function getRoleCategoryLabel(value: string): string {
  const found = ROLE_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}

// ---- Slug helpers for URL-safe paths ----
export function tldToSlug(tld: string): string {
  // e.g. "vercel.app" -> "vercel-app", "is-a.dev" -> "is-a-dev"
  return tld.replace(/\./g, "-");
}

export function slugToTld(slug: string): string | undefined {
  // Reverse: try to find a matching TLD
  // First check exact compound TLD match
  for (const compound of KNOWN_COMPOUND_TLDS) {
    if (tldToSlug(compound) === slug) return compound;
  }
  // For simple TLDs the slug is the same as the TLD
  return slug;
}
