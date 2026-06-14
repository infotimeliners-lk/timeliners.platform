// netlify/edge-functions/sitemap.js
const SB_URL = 'https://xilhrpbqdqocpwxaigvy.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGhycGJxZHFvY3B3eGFpZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTE1OTMsImV4cCI6MjA4OTU4NzU5M30.L1w00wbDp9ej3MqHTIOwWnfg2w6vMKAjS4-r51kpkoY';

const STATIC_PAGES = [
  { url: 'https://timeliners.lk/',              changefreq: 'weekly', priority: '1.0' },
  { url: 'https://timeliners.lk/terms.html',   changefreq: 'yearly', priority: '0.3' },
  { url: 'https://timeliners.lk/privacy.html', changefreq: 'yearly', priority: '0.3' },
  { url: 'https://timeliners.lk/refund.html',  changefreq: 'yearly', priority: '0.3' },
];

export default async function handler(request, context) {
  const url = new URL(request.url);
  if (url.pathname !== '/sitemap.xml') {
    return context.next();
  }
  try {
    let allProfiles = [];
    let from = 0;
    const PAGE_SIZE = 1000;
    while (true) {
      const res = await fetch(
        `${SB_URL}/rest/v1/profiles?select=username,updated_at&order=updated_at.desc&limit=${PAGE_SIZE}&offset=${from}`,
        {
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
            'Accept': 'application/json',
            'Range-Unit': 'items',
          }
        }
      );
      if (!res.ok) break;
      const batch = await res.json();
      if (!batch || batch.length === 0) break;
      allProfiles = allProfiles.concat(batch);
      if (batch.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const today = new Date().toISOString().split('T')[0];

    const staticEntries = STATIC_PAGES.map(p => `
  <url>
    <loc>${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    const profileEntries = allProfiles
      .filter(p => p.username && p.username.trim() !== '')
      .map(p => {
        const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today;
        return `
  <url>
    <loc>https://timeliners.lk/${encodeURIComponent(p.username)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${profileEntries}
</urlset>`;

    return new Response(xml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex',
      }
    });
  } catch (err) {
    console.error('sitemap edge function error:', err);
    return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}

export const config = {
  path: '/sitemap.xml',
};
