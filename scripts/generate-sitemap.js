// scripts/generate-sitemap.js
// Run with: node scripts/generate-sitemap.js
// This script builds public/sitemap.xml and public/robots.txt
// It includes static routes + blog posts read from public/content/blog-index.json

const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

// -------- CONFIG - edit these for your site --------
const hostname = 'https://syedsolarenergy.com'; // <-- CHANGE to your actual domain (no trailing slash)
const publicFolder = path.join(__dirname, '..', 'public');
const blogIndexPath = path.join(publicFolder, 'content', 'blog-index.json'); // existing file from earlier steps

// Static routes to include in sitemap (edit to match your site)
const staticRoutes = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.6 },
  { url: '/services', changefreq: 'monthly', priority: 0.7 },
  { url: '/projects', changefreq: 'weekly', priority: 0.7 },
  { url: '/blog', changefreq: 'weekly', priority: 0.8 },
  { url: '/faq', changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', changefreq: 'monthly', priority: 0.5 }
];
// --------------------------------------------------

async function buildSitemap() {
  try {
    // Ensure public folder exists
    if (!fs.existsSync(publicFolder)) fs.mkdirSync(publicFolder, { recursive: true });

    const sitemapStream = new SitemapStream({ hostname });
    const writeStream = fs.createWriteStream(path.join(publicFolder, 'sitemap.xml'));

    // Pipe stream to file
    sitemapStream.pipe(writeStream);

    // Add static routes
    for (const r of staticRoutes) {
      sitemapStream.write({
        url: r.url,
        changefreq: r.changefreq || 'monthly',
        priority: r.priority || 0.5,
        // lastmod can be set if you want
      });
    }

    // Add blog posts by reading blog-index.json (if exists)
    if (fs.existsSync(blogIndexPath)) {
      const indexRaw = fs.readFileSync(blogIndexPath, 'utf8');
      const paths = JSON.parse(indexRaw); // e.g. [ "/content/blog/daytime-vs-hybrid.json", ... ]

      for (const contentPath of paths) {
        try {
          // Resolve file path in public
          const fullPath = path.join(publicFolder, contentPath.replace(/^\//, ''));
          if (!fs.existsSync(fullPath)) continue; // skip if missing

          const postJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          // Expect postJson.slug and postJson.date (ISO). If not, attempt to infer slug from filename.
          const slug = postJson.slug || path.basename(fullPath, '.json');
          const postUrl = `/blog/${slug}`;
          const lastmod = postJson.date || null;

          sitemapStream.write({
            url: postUrl,
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: lastmod
          });
        } catch (err) {
          // ignore individual file errors, continue
          console.warn('Skipping blog file, error reading:', contentPath, err.message);
        }
      }
    } else {
      console.warn('No blog-index.json found at', blogIndexPath);
    }

    sitemapStream.end();

    // Wait until finished
    await streamToPromise(sitemapStream);

    // Optional: write robots.txt pointing to sitemap
    const robots = `User-agent: *
Allow: /
Sitemap: ${hostname}/sitemap.xml
`;
    fs.writeFileSync(path.join(publicFolder, 'robots.txt'), robots, 'utf8');

    console.log('Sitemap and robots.txt created in public/ successfully.');
  } catch (err) {
    console.error('Failed to create sitemap:', err);
    process.exit(1);
  }
}

buildSitemap();
