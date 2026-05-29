import fs from "node:fs";
import path from "node:path";

const DEFAULT_SITE_URL = "https://tripwire-3gk.pages.dev";
const LASTMOD = "2026-05-29";
const CHANGEFREQ = "weekly";
const SITEMAP_PATH = "sitemap.xml";
const ROBOTS_PATH = "robots.txt";
const REPORT_PATH = "reports/sitemap.example.md";

const PUBLIC_PAGES = [
  { path: "/", priority: "1.0" },
  { path: "/cards/", priority: "0.8" },
  { path: "/checklists.html", priority: "0.8" },
  { path: "/commands.html", priority: "0.8" },
  { path: "/after-incident.html", priority: "0.8" },
  { path: "/sources.html", priority: "0.7" },
  { path: "/ai-rules/", priority: "0.8" },
  { path: "/ja/", priority: "1.0" },
  { path: "/ja/cards/", priority: "0.8" },
  { path: "/ja/checklists.html", priority: "0.8" },
  { path: "/ja/commands.html", priority: "0.8" },
  { path: "/ja/after-incident.html", priority: "0.8" },
  { path: "/ja/sources.html", priority: "0.7" },
  { path: "/ja/ai-rules/", priority: "0.8" }
];

const EXCLUDED_PREFIXES = ["docs/", "reports/", "scripts/", "data/", "downloads/"];

function normalizeBaseUrl(input) {
  const rawBaseUrl = (input || DEFAULT_SITE_URL).trim();

  if (rawBaseUrl === "") {
    throw new Error("SITE_URL must not be empty");
  }

  let parsed;
  try {
    parsed = new URL(rawBaseUrl);
  } catch {
    throw new Error(`SITE_URL must be an absolute URL: ${rawBaseUrl}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`SITE_URL must use http or https: ${rawBaseUrl}`);
  }

  return rawBaseUrl.replace(/\/+$/, "");
}

function localPathForPublicPath(publicPath) {
  if (!publicPath.startsWith("/")) {
    throw new Error(`Public path must start with /: ${publicPath}`);
  }

  if (publicPath.endsWith("/")) {
    return path.join(publicPath.slice(1), "index.html");
  }

  return publicPath.slice(1);
}

function validatePublicPages() {
  const seenPaths = new Set();

  for (const page of PUBLIC_PAGES) {
    if (seenPaths.has(page.path)) {
      throw new Error(`Duplicate public page path: ${page.path}`);
    }
    seenPaths.add(page.path);

    const localPath = localPathForPublicPath(page.path);
    const normalizedLocalPath = localPath.split(path.sep).join("/");

    if (EXCLUDED_PREFIXES.some((prefix) => normalizedLocalPath.startsWith(prefix))) {
      throw new Error(`Public sitemap page must not be in excluded path: ${normalizedLocalPath}`);
    }

    if (!fs.existsSync(localPath)) {
      throw new Error(`Public sitemap page is missing locally: ${page.path} -> ${localPath}`);
    }
  }
}

function absoluteUrlForPage(baseUrl, publicPath) {
  const url = `${baseUrl}${publicPath}`;
  const parsed = new URL(url);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Generated URL must be absolute http(s): ${url}`);
  }

  return url;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSitemap(urls) {
  const entries = urls.map(({ url, priority }) => [
    "  <url>",
    `    <loc>${escapeXml(url)}</loc>`,
    `    <lastmod>${LASTMOD}</lastmod>`,
    `    <changefreq>${CHANGEFREQ}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ].join("\n"));

  return `${[
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...entries,
    "</urlset>"
  ].join("\n")}\n`;
}

function renderRobots(baseUrl) {
  return `${[
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${baseUrl}/sitemap.xml`
  ].join("\n")}\n`;
}

function renderReport(baseUrl, urls) {
  return `${[
    "# Tripwire Sitemap Report",
    "",
    `Base URL: ${baseUrl}  `,
    "Network access: false",
    "",
    "## Summary",
    "",
    `- URLs included: ${urls.length}`,
    "- sitemap.xml written: true",
    "- robots.txt written: true",
    "",
    "## Included URLs",
    "",
    ...urls.map(({ url }) => `- ${url}`)
  ].join("\n")}\n`;
}

function writeFile(filePath, content) {
  const directory = path.dirname(filePath);

  if (directory !== ".") {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  const baseUrl = normalizeBaseUrl(process.env.SITE_URL);
  validatePublicPages();

  const urls = PUBLIC_PAGES.map((page) => ({
    ...page,
    url: absoluteUrlForPage(baseUrl, page.path)
  }));

  for (const { url } of urls) {
    const parsed = new URL(url);
    if (!parsed.protocol || !parsed.host) {
      throw new Error(`Generated URL is not absolute: ${url}`);
    }
  }

  writeFile(SITEMAP_PATH, renderSitemap(urls));
  writeFile(ROBOTS_PATH, renderRobots(baseUrl));
  writeFile(REPORT_PATH, renderReport(baseUrl, urls));

  console.log(`Wrote ${SITEMAP_PATH}, ${ROBOTS_PATH}, and ${REPORT_PATH}`);
  console.log(`URLs included: ${urls.length}`);
}

main();
