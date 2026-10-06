# TimeLiners — Architecture

## 1. High-level stack

- **Frontend**: a single self-contained `index.html` — vanilla HTML/CSS/JS, one large IIFE, no framework, no build step, hand-rolled hash-based router (e.g. `#/feed`)
- **Backend**: Supabase (project ref `xilhrpbqdqocpwxaigvy`, Pro plan) — Postgres, Auth, Storage, RLS, and edge functions
- **Video storage**: Cloudflare R2, `timeliners-videos` bucket
- **Video delivery**: a custom Cloudflare Worker, `timeliners-video-gatekeeper`, sitting in front of the R2 bucket
- **Image storage/delivery**: plain public R2 domain (`pub-902baa20af1b466dbe58a28e6bc705e7.r2.dev`), deliberately not behind the gatekeeper, so covers and avatars stay fetchable without a Referer (WhatsApp/Facebook link previews, search indexing)
- **Email**: Resend, sending from `noreply@timeliners.site`, via the `send-email` edge function
- **Hosting**: Netlify, credit-based plan, connected to GitHub (`infotimeliners-lk/timeliners.platform`, main branch) as source of truth, though production deploys are manual
- **Backups**: weekly automated `pg_dump` via GitHub Actions, gzipped, pushed to a private R2 bucket (`timeliners-backups`), 60-day retention

## 2. Frontend architecture

Everything lives in one `index.html`: feed, dashboard, profile pages, upload flow, project editing, and auth. It ships as a single minified, obscured file (comments and `console.*` output stripped) — no separate "readable" version is delivered.

Because the whole app runs inside one IIFE, any function invoked from an inline `onclick`/`onchange` HTML attribute must be added to the `window.X = X` exposure list near the end of the script, or it silently throws "X is not defined" despite otherwise-valid code. This has caused real shipped bugs before and is the first thing to check when a new click handler doesn't fire.

Separate files alongside it: `finance.html` (manual payments/plan admin), `terms.html`, `privacy.html`, `refund.html`, `404.html`, `maintenance.html`.

## 3. Data layer (Supabase Postgres)

Key tables and how they're used:

- **`profiles`** — publicly readable (`public_read` RLS, `qual = true`). A `BEFORE UPDATE` trigger silently resets any attempt by a non-admin, non-service-role actor to change `plan`, `pay_status`, `verified`, `featured`, `timmy_unlimited`, `timmy_marketing_unlocked`, `member_no`, or `hidden` back to its previous value, preventing self-granted Pro/verified/boost status.
- **`projects`** — `status` is `draft` or `published`. Two generated columns, `has_video` and `has_cover`, were added in September 2026 specifically to support lightweight feed queries (see Section 5). `playback_fail_count` drives automatic quarantine of broken uploads.
- **`payments`** — plan, `pay_status`, slip URL, member number, etc. RLS: service role has full access, the admin account (finance.html login) has scoped access, and an `owner_select_own_payments` policy lets a user read their own row. `expires_date` is a generated column that returns null forever for `plan = 'pro-lifetime'`.
- **`trusted_devices`**, **`admin_otp_codes`**, **`click_rate_limit`**, **`analytics_events`**, **`saved_projects`** — supporting tables for device-trust login, rate limiting, and the Save feature.
- Rate limiting pattern: engagement RPCs (hire clicks, social clicks, view counts, playback-error reports) are all backed by `click_rate_limit`, generally a 10-second window per action, 5 minutes for playback-error reports.

## 4. Media pipeline

**Upload**: video files are compressed client-side with ffmpeg.wasm into a 720p "HQ" variant (CRF 26) and a 360p "LQ" variant, both with `-movflags +faststart`, with HEVC-track detection to catch files that won't play in-browser. The `r2-sign-upload` edge function issues signed upload URLs and returns the public URL, built from the `R2_PUBLIC_URL` environment variable; only video URLs are routed through the gatekeeper, cover images and avatars intentionally keep the plain public link.

**Playback**: the `timeliners-video-gatekeeper` Worker only serves a video to requests whose Referer or Origin matches `timeliners.lk`/`www.timeliners.lk`. It supports full HTTP Range requests (206 Partial Content), and as of September 2026 caches the complete video file at Cloudflare's edge, serving every Range/seek request as a slice of that one cached copy rather than re-reading R2 each time (1-day TTL, files over 400MB are never cached). It also sets CORS headers for the two allowed origins, needed for reading a video frame client-side to auto-generate a cover thumbnail.

The old, fully public r2.dev link for video is still enabled in parallel as a rollback safety net. It cannot be disabled yet because cover images and avatars still depend on a public, no-Referer-required link; that's tracked as a separate future task (Section 7 of the PRD).

## 5. Feed architecture (redesigned September 2026 for scale)

**The original problem**: the feed fetched every published project's complete row, including the actual video, cover, and avatar URLs, on every load. That was fine at a few hundred projects but would have gotten progressively slower, especially on mobile data, as the platform grew, since most of that payload (media links) is never needed until a specific card is actually scrolled into view.

**Current design — a two-stage load:**

1. **Light stage** (loaded for every project, on every feed open): `id, title, description, tags, cat, has_video, has_cover, likes, views, created_at, user_id, status, playback_fail_count, author_name, author_init, featured, grad_idx`. Roughly 640 bytes per project. This alone is enough to run category filtering, every sort mode, the full ranking algorithm, and text search — nothing about those features needed the actual media links, only whether a video/cover exists.
2. **Heavy stage** (loaded only for the batch of cards about to render): `video_url, video_urls_lq, cover_url, author_avatar, yt_link`, fetched by id (`id=in.(...)`) right before that batch is built, and additionally pre-fetched one batch ahead in the background as soon as the current batch finishes rendering — so under normal scroll speeds, the data is already sitting ready by the time it's actually needed.

**Rendering**: 8 cards per scroll batch. Infinite scroll fires 2000px before the bottom of the page (raised from 800px) so there's enough runway for the background prefetch to land before the user visually reaches it.

**Ranking algorithm** blends: raw likes/views, a recency decay, a quality multiplier of up to 1.45x (rewards a real title, real description, and a real cover — including a check that filters out lazy generic titles like "Video Edit" or "Untitled"), a graduated staleness penalty for old underperforming projects (Pro accounts absorb only half of this penalty, they are not exempt), a flat 1.2x Pro-author boost, same-author spacing so one account's projects don't cluster together, Pro-project spacing (minimum 3 apart), a guaranteed "new project" floor within the first 10 cards, and automatic quarantine (2+ independent playback-failure reports fully removes a project from ranking in every sort mode; 1 report applies a heavy score penalty within its own pool).

**Caching**: the light payload is cached client-side in `sessionStorage` for 5 minutes. Heavy media is never cached across sessions, it's fetched fresh per visit, which is intentional and keeps the design simple.

**Runway**: at roughly 640 bytes per project for the light stage, and current growth of 80 to 100 published projects a month, this design comfortably holds for well over a year before the light stage itself would need any kind of cap. The heavy stage has no meaningful ceiling at all, since it only ever loads what's actually on screen.

## 6. Security posture (last full audit: September 2026)

- RLS reviewed and tightened across `profiles`, `projects`, `analytics_events`, `trusted_devices`, scoped to `auth.uid()` where appropriate
- All engagement RPCs are rate-limited
- The `payment-slips` storage bucket was found fully public and fixed to private
- `bug_reports` was found readable/writable by any logged-in user and fixed to admin/service-role only
- A `BEFORE UPDATE` trigger prevents any user from self-granting Pro, verified, or feed-boost status by directly patching their own profile/project row
- **Known residual gap**: admin-only profile columns (`contact_phone`, `pay_status`, `pay_due`, `member_no`, `hidden`, `timmy_unlimited`, `timmy_marketing_unlocked`, `timmy_questions_used`) are locked down from the anonymous role, but an authenticated account could still pull those columns for *other users* via a direct API call, since Postgres RLS can't combine a per-row and per-column restriction in one policy. Fully closing this needs a `profiles`/`profiles_public` view split; not yet built.
- No exposed secrets found in `index.html` (only the expected public Supabase anon key and Turnstile site key, both meant to be public)
- httpOnly-cookie-based session storage (instead of Supabase's default localStorage token) was considered for XSS-theft resistance, and deliberately parked: no known live XSS bug exists, existing HTML-escaping already mitigates the risk, and it's a multi-day change touching the core login flow that isn't worth the effort without an active threat

## 7. Known technical debt

- **Single-file `index.html`**: currently around 3,500 lines minified. Not a performance problem for end users (it's one file either way), but a real friction point for development: every edit means loading the entire file, and there's no clear boundary between "feed code," "dashboard code," and "upload code." Splitting it into organized files is on the roadmap, not urgent.
- **Feed-cache assumptions in delete/edit flows**: when the feed moved to the light/heavy split above, two flows that previously assumed the global project cache always had full media URLs broke silently: deleting a project (needed the real video/cover URLs to clean up R2) and editing a project (needed the real video list to know what survives an edit, with real risk of wiping a project's video on save if it didn't). Both were fixed by having delete and edit independently fetch a fresh, complete copy of that one specific project before acting, rather than trusting whatever happened to be in the shared feed cache. A pre-existing, unrelated storage leak in one of the two delete paths (the card's own three-dot menu never cleaned up R2 files at all) was also found and fixed during this work.

## 8. Deployment workflow

- **Source of truth**: GitHub repo `infotimeliners-lk/timeliners.platform`, main branch, holding `index.html` plus the legal pages, `_redirects`, `netlify.toml`, and supporting folders (`finance/`, `netlify/`, `supabase/`, `.github/`)
- **Production deploy**: manual — the finished `index.html` is dragged onto Netlify's Deploys page for the production site; there is no CI/CD pipeline
- **Staging**: `timeliners-staging.netlify.app`, deployed the same manual way, used to test changes before they go to production. Since each production deploy costs Netlify credits, testing is batched into complete rounds rather than one fix per deploy.
- **Caveat**: video playback will fail on staging or on a local `file://` copy unless the gatekeeper Worker's allowed-origins list is updated to also trust that origin, which is not currently done — this is expected, not a bug, when testing locally.
