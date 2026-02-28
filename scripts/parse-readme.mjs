import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const readmePath = join(__dirname, "..", "DATA.md");
const outputPath = join(__dirname, "..", "src", "data", "domains.json");

const readme = readFileSync(readmePath, "utf-8");

// Match lines like: - [Name](URL) [Optional Role]
// Also handles optional trailing text like " - Animated" or " (Dark Mode)" etc.
const lineRegex = /^-\s+\[([^\]]+)\]\(([^)]+)\)(?:\s+\[([^\]]*)\])?/;

const entries = [];
const seenUrls = new Set();

for (const line of readme.split("\n")) {
  const trimmed = line.trim();
  const match = trimmed.match(lineRegex);
  if (!match) continue;

  const name = match[1].trim();
  let url = match[2].trim();
  const role = match[3]?.trim() || null;

  // Normalize URL: strip protocol, www, trailing slashes, paths
  // We want just the domain
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    let domain = parsed.hostname.replace(/^www\./, "");

    // Skip non-portfolio URLs (github pages with paths that are clearly project pages, etc.)
    // But keep is-a.dev, github.io, vercel.app, netlify.app etc. as valid portfolio hosts
    if (!domain) continue;

    // Deduplicate by domain
    if (seenUrls.has(domain)) continue;
    seenUrls.add(domain);

    entries.push({
      id: entries.length + 1,
      domain,
      name,
      role,
    });
  } catch {
    // Skip malformed URLs
    continue;
  }
}

writeFileSync(outputPath, JSON.stringify(entries, null, 2) + "\n");
console.log(`Parsed ${entries.length} unique portfolios → ${outputPath}`);
