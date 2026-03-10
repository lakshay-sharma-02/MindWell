import fs from "fs";
import path from "path";

// Production URL of the website
const SITE_URL = "https://psychespace.vercel.app";

// List of all static routes in the application
const routes = [
  "/",
  "/about",
  "/services",
  "/blog",
  "/podcasts",
  "/resources",
  "/book",
  "/contact",
  "/quiz",
  "/stories",
  "/community",
  "/tools",
];

function generateSitemap() {
  const currentDate = new Date().toISOString();

  const xmlUrls = routes
    .map((route) => {
      // Priority: Root is 1.0, main pages 0.8, others 0.6
      let priority = "0.8";
      let changefreq = "weekly";

      if (route === "/") {
        priority = "1.0";
        changefreq = "daily";
      } else if (
        ["/blog", "/podcasts", "/resources", "/stories"].includes(route)
      ) {
        changefreq = "daily";
      } else if (["/quiz", "/tools"].includes(route)) {
        priority = "0.6";
        changefreq = "monthly";
      }

      return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`;

  // Write to the public directory so it's served at the root
  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const outputPath = path.resolve(publicDir, "sitemap.xml");
  fs.writeFileSync(outputPath, sitemap, "utf8");

  console.log(`✅ Sitemap successfully generated at ${outputPath}`);
}

generateSitemap();
