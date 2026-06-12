// netlify/edge-functions/profile-seo.js
// Intercepts crawler requests to timeliners.lk/:username
// Returns a pre-rendered HTML page with full SEO meta tags
// Regular users still get the normal SPA (index.html)

const SB_URL = 'https://xilhrpbqdqocpwxaigvy.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbGhycGJxZHFvY3B3eGFpZ3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTE1OTMsImV4cCI6MjA4OTU4NzU5M30.L1w00wbDp9ej3MqHTIOwWnfg2w6vMKAjS4-r51kpkoY';

// Known page slugs that are NOT usernames — skip these
const KNOWN_PAGES = ['feed', 'pricing', 'faq', 'profile', 'dashboard', 'project', 'index.html'];

// Bots that should receive the pre-rendered SEO page
const BOT_PATTERNS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
  'yandexbot', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot', 'applebot',
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
  // Google's various testing/inspection tools and other crawlers
  'google-inspectiontool', 'googleother', 'storebot-google',
  'google-extended', 'chrome-lighthouse', 'adsbot-google',
  'mediapartners-google', 'feedfetcher-google', 'google-read-aloud',
  'pinterest', 'discordbot', 'redditbot', 'skypeuripreview',
  'vkshare', 'w3c_validator', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterestbot', 'slackbot',
  'developers.google.com'
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(bot => ua.includes(bot));
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(request, context) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Extract the slug from the path e.g. /kaveesha → "kaveesha"
  const slug = url.pathname.replace(/^\//, '').split('/')[0].toLowerCase();

  // Skip known pages, empty slugs, and static file extensions
  if (!slug || KNOWN_PAGES.includes(slug) || /\.(html|js|css|png|ico|svg|txt|xml|json)$/.test(slug)) {
    return context.next();
  }

  // Only pre-render for bots — regular users get the normal SPA
  if (!isBot(userAgent)) {
    return context.next();
  }

  try {
    // Fetch profile from Supabase by username
    const profileRes = await fetch(
      `${SB_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(slug)}&select=id,name,username,role,bio,city,exp,skills,skills_data,avatar_url,plan,verified`,
      {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Accept': 'application/json',
        }
      }
    );

    if (!profileRes.ok) return context.next();
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) return context.next();

    const p = profiles[0];

    // Fetch their published projects too (for structured data)
    const projRes = await fetch(
      `${SB_URL}/rest/v1/projects?user_id=eq.${p.id}&select=id,title,description,category,thumbnail_url&order=created_at.desc&limit=6`,
      {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`,
          'Accept': 'application/json',
        }
      }
    );
    const projects = projRes.ok ? await projRes.json() : [];

    // Build readable skills list from skills_data JSONB
    let skillsList = '';
    if (p.skills_data && Array.isArray(p.skills_data) && p.skills_data.length > 0) {
      skillsList = p.skills_data.map(s => s.name || s).filter(Boolean).join(', ');
    } else if (p.skills) {
      skillsList = p.skills;
    }

    const name        = escapeHtml(p.name || slug);
    const role        = escapeHtml(p.role || 'Video Editor');
    const city        = escapeHtml(p.city || 'Sri Lanka');
    const bio         = escapeHtml(p.bio || '');
    const exp         = escapeHtml(p.exp || '');
    const username    = escapeHtml(p.username || slug);
    const avatarUrl   = p.avatar_url || 'https://timeliners.lk/og-default.png';
    const profileUrl  = `https://timeliners.lk/${username}`;
    const isPro       = ['pro','pro-yearly','pro_yearly','standard','vip'].includes(p.plan || '');
    const isVerified  = p.verified || isPro;

    // Page title: "Name — Role | TimeLiners"
    const pageTitle = `${name} — ${role} in ${city} | TimeLiners`;

    // Meta description
    const metaDesc = bio
      ? `${bio.slice(0, 140)}${bio.length > 140 ? '…' : ''}`
      : `${name} is a ${role} based in ${city}, Sri Lanka. View their video editing portfolio on TimeLiners.`;

    // Build project cards HTML
    const projectsHtml = projects.length > 0
      ? projects.map(proj => `
        <div class="proj-card">
          ${proj.thumbnail_url ? `<img src="${escapeHtml(proj.thumbnail_url)}" alt="${escapeHtml(proj.title || 'Project')}" loading="lazy" width="320" height="180">` : ''}
          <div class="proj-info">
            <strong>${escapeHtml(proj.title || 'Untitled')}</strong>
            ${proj.category ? `<span class="cat">${escapeHtml(proj.category)}</span>` : ''}
            ${proj.description ? `<p>${escapeHtml(proj.description.slice(0, 100))}${proj.description.length > 100 ? '…' : ''}</p>` : ''}
          </div>
        </div>`).join('')
      : '';

    // JSON-LD structured data for Google
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: p.name || slug,
      jobTitle: p.role || 'Video Editor',
      description: p.bio || '',
      url: profileUrl,
      image: avatarUrl,
      address: { '@type': 'PostalAddress', addressCountry: 'LK', addressLocality: p.city || 'Sri Lanka' },
      knowsAbout: skillsList ? skillsList.split(',').map(s => s.trim()) : ['Video Editing'],
      sameAs: [`https://timeliners.lk/${username}`]
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${profileUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${profileUrl}">
  <meta property="og:image" content="${escapeHtml(avatarUrl)}">
  <meta property="og:site_name" content="TimeLiners">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDesc}">
  <meta name="twitter:image" content="${escapeHtml(avatarUrl)}">

  <!-- Structured Data -->
  <script type="application/ld+json">${jsonLd}</script>

  <style>
    * { margin: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #0e0e0f; color: #e8e8e8; padding: 2rem 1rem; }
    .container { max-width: 900px; margin: 0 auto; }
    .profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #222; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: #222; flex-shrink: 0; }
    .profile-name { font-size: 1.6rem; font-weight: 700; color: #fff; }
    .profile-role { font-size: 1rem; color: #FE730A; margin: .25rem 0; }
    .profile-meta { font-size: .85rem; color: #888; }
    .badge { display: inline-block; background: #FE730A; color: #fff; font-size: .65rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: .15rem .5rem; border-radius: 50px; margin-left: .5rem; vertical-align: middle; }
    .bio { font-size: .95rem; color: #aaa; line-height: 1.7; margin-bottom: 1.5rem; max-width: 680px; }
    .skills { margin-bottom: 2rem; }
    .skills h2 { font-size: .75rem; letter-spacing: 1.5px; text-transform: uppercase; color: #555; margin-bottom: .75rem; }
    .skill-tags { display: flex; flex-wrap: wrap; gap: .5rem; }
    .skill-tag { background: #1a1a1b; border: 1px solid #2a2a2b; padding: .3rem .75rem; border-radius: 50px; font-size: .8rem; color: #ccc; }
    .projects h2 { font-size: .75rem; letter-spacing: 1.5px; text-transform: uppercase; color: #555; margin-bottom: 1rem; }
    .proj-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .proj-card { background: #141415; border: 1px solid #222; border-radius: 10px; overflow: hidden; }
    .proj-card img { width: 100%; height: 160px; object-fit: cover; display: block; }
    .proj-info { padding: .85rem; }
    .proj-info strong { font-size: .9rem; color: #e8e8e8; display: block; margin-bottom: .3rem; }
    .cat { font-size: .7rem; color: #FE730A; text-transform: uppercase; letter-spacing: .8px; display: block; margin-bottom: .4rem; }
    .proj-info p { font-size: .8rem; color: #888; line-height: 1.5; }
    .cta { margin-top: 2.5rem; padding: 1.5rem; background: #141415; border: 1px solid #222; border-radius: 12px; text-align: center; }
    .cta p { color: #888; font-size: .9rem; margin-bottom: 1rem; }
    .cta a { background: #FE730A; color: #fff; text-decoration: none; padding: .65rem 1.5rem; border-radius: 8px; font-weight: 600; font-size: .9rem; }
    .tl-link { display: block; text-align: center; margin-top: 2rem; font-size: .75rem; color: #444; text-decoration: none; }
    .tl-link span { color: #FE730A; }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-header">
      <img class="avatar" src="${escapeHtml(avatarUrl)}" alt="${name}" onerror="this.style.background='#222'">
      <div>
        <div class="profile-name">
          ${name}${isVerified ? '<span class="badge">Verified</span>' : ''}
        </div>
        <div class="profile-role">${role}</div>
        <div class="profile-meta">
          📍 ${city}${exp ? ` &nbsp;·&nbsp; ${exp} experience` : ''} &nbsp;·&nbsp; Sri Lanka
        </div>
      </div>
    </div>

    ${bio ? `<p class="bio">${bio}</p>` : ''}

    ${skillsList ? `
    <div class="skills">
      <h2>Skills</h2>
      <div class="skill-tags">
        ${skillsList.split(',').map(s => `<span class="skill-tag">${escapeHtml(s.trim())}</span>`).join('')}
      </div>
    </div>` : ''}

    ${projectsHtml ? `
    <div class="projects">
      <h2>Portfolio Projects</h2>
      <div class="proj-grid">${projectsHtml}</div>
    </div>` : ''}

    <div class="cta">
      <p>Want to hire ${name}? View their full portfolio on TimeLiners.</p>
      <a href="${profileUrl}">View Full Portfolio →</a>
    </div>

    <a class="tl-link" href="https://timeliners.lk">
      Powered by <span>TimeLiners</span> — Sri Lanka's Portfolio Platform for Video Editors
    </a>
  </div>

  <!-- Redirect real users to the SPA immediately -->
  <script>
    // If this is a real user (not a bot), send them to the full app
    window.location.replace('https://timeliners.lk/${username}');
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'index, follow',
      }
    });

  } catch (err) {
    // On any error, fall through to normal SPA
    console.error('profile-seo edge function error:', err);
    return context.next();
  }
}

export const config = {
  path: '/*',
};
