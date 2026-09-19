import { mkdir, writeFile } from "node:fs/promises";
import { publicRoutes, siteUrl } from "../seo.config.mjs";

const output = new URL("../public/", import.meta.url);
const updated = new Date().toISOString().slice(0, 10);
const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

await mkdir(output, { recursive: true });

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...publicRoutes.map(({ path, changefreq, priority }) => [
    "  <url>",
    `    <loc>${escapeXml(siteUrl + path)}</loc>`,
    `    <lastmod>${updated}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");

const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin/",
  "Disallow: /login",
  "Disallow: /access",
  "",
  `Sitemap: ${siteUrl}/sitemap.xml`,
  "",
].join("\n");

await Promise.all([
  writeFile(new URL("sitemap.xml", output), sitemap, "utf8"),
  writeFile(new URL("robots.txt", output), robots, "utf8"),
]);

console.log(`Generated SEO files for ${publicRoutes.length} public routes.`);

