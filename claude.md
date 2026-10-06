# TimeLiners memory backup (exported Oct 4, 2026)

Everything Claude has saved about Kaveesha and TimeLiners. Paste this into a new chat (or a new Claude account) and say "this is my saved memory, use it as context".

---

## PROFILE

- Name: Kaveesha
- Solo founder and operator of TimeLiners (timeliners.lk), a Sri Lankan portfolio platform for video editors and motion designers
- Former freelance video editor
- Based in Sri Lanka (Asia/Colombo, UTC+5:30)
- Not a developer. Claude handles all code changes; Kaveesha uploads files and deploys manually
- Sees content creation as a core part of her identity alongside building TimeLiners

---

## PREFERENCES (how Claude should work)

- Recall all TimeLiners context (coding + documentation) across chats without re-explanation
- When Kaveesha says "start my day," "whatsapp today," or similar, proactively check and report: (1) new/unread Gmail from today, (2) current Supabase project/user/upload counts for TimeLiners, (3) any known bugs/issues across Netlify, Cloudflare, Supabase, GitHub connector, Resend, (4) today's Google Calendar events
- On any index.html edit session, proactively (without being asked) check for exposed secrets (hardcoded Resend/R2 API keys; the Supabase anon key is fine/expected) and rate-limiting on public write endpoints; report findings directly
- Do NOT prompt "did you deploy this?" or assume recent code changes are live. Undeployed work is intentional
- After making any change (code or database), check whether it broke anything before considering the task done
- When she asks "any errors or anything?" about TimeLiners, she means the core user flows: log in, sign ups, project uploading, etc. Check those for errors
- Every user-facing error message must be simple, readable and say plainly what is wrong (users don't know the cause, Kaveesha does), and what to do next, including errors that come from the database or server

---

## TIKTOK / INSTAGRAM BRAND

- Building a personal brand presence on TikTok and Instagram alongside the platform
- TikTok is the primary personal brand/growth channel
- Instagram strategy: English-only; simple text overlay Reels (find existing video, add text + trending music, credit creator); Kaveesha-designed carousels; Stories for updates
- Four content pillars: editor tips, TimeLiners features, community spotlights, relatable editor life
- Goal: 1,000 engaged followers
- When writing Reel scripts: include text overlay, video type suggestion, music style, keyword-rich caption (3 to 5 hashtags max)

---

## THEMES MONETIZATION (history, killed)

- Themes was a purchasable-profile-theme monetization model (WhatsApp-purchase, manually granted via finance.html) that replaced earlier scrapped monetization (Timmy AI, sponsor ads, Pro subscription)
- Decision: killed Themes fully, reverting TimeLiners to "classic" with no new features. Removed from index.html, finance.html, and the Supabase backend without breaking the live site
- Removal completed: index.html (theme store page, dashboard "My Themes" panel, theme detail modal, customize-theme FAB, related CSS/JS/nav links), finance.html (Themes admin tab/pane, New Theme modal, theme owners modal, member grant/revoke modal, "Theme" column, related JS), Supabase (dropped themes, user_themes, theme_ratings tables, enforce_active_theme_ownership and recompute_theme_rating triggers/functions, profiles.active_theme_id column)
- Left in place as harmless: a few inert CSS custom-property hooks in index.html (prof-decor-*, prof-footer-strip, var(--prof-hire-r) etc fallbacks); the unused theme_granted email template in the send-email edge function
- The planned but never shipped "Pixel Art" theme is abandoned
- History: Timmy AI feature was fully scrapped after several iterations (keyword bot, streaming chatbot with token monetization, digest board, edit-checker concept). DB objects deleted; edge functions (timmy-chat, timmy-digest, check-expired-pros, notify-inquiry) remain deployed but inert; ANTHROPIC_API_KEY/CRON_SECRET secrets still need manual removal from the dashboard
- History: sponsor ads feature was fully built then fully scrapped, all infrastructure removed
- History: Pro subscription was scrapped twice
- Noted worry about any future Pro relaunch: traffic was very low at the time (3,075 lifetime profile views, 603 lifetime hire clicks across 395 profiles)

---

## MARKETING AND PAYMENTS HISTORY

- Growth channels tested: Facebook/Instagram paid ads (Traffic objective, LKR 500 to 700/day), TikTok Promote, WhatsApp direct outreach to Sri Lankan editing community, newsletter (Resend, 100 emails/day free tier)
- Payment history: manual bank transfer via WhatsApp, slip upload, finance panel confirmation
- PayHere, Gumroad, Lemon Squeezy, Paddle all explored and deprioritized
- PayPal Sri Lanka rollout confirmed cross-border only (not viable for local LKR payments)
- Genie Business (Dialog) application submitted
- Marketing strategy (Sep 2026): focus acquisition on new editors riding hype/excitement rather than nurturing existing ones. Most editors are part-time/casual and churn after a few months, so a one time "lifetime access" offer priced to beat about 4 months of subscription value should be pitched near signup/onboarding. Pro features cost nothing extra to grant permanently
- Decision (Sep 2026): recurring pricing (LKR 1,490/mo, 14,900/yr) scrapped before going live. Pro is a single one time purchase at LKR 7,990, no recurring tiers, no expiry. No existing Pro members then, so no migration
- Oct 2, 2026: a potential investor is coming; presenting revenue + marketing. Pro Lifetime chosen because it's easier to sell and editors don't drop off after 2 months. Main acquisition focus is new/beginner editors. Brand goal: TimeLiners should be the first thing that comes to mind when editors talk about editing
- Oct 2, 2026 influencer plan (locked in): use several mid tier influencers rather than one; onboard 1 or 2 new influencers per week; each makes 2 videos (1: overall site, editors build portfolios and clients hire them; 2: promoting Pro); script written together with the influencer, they upload, repeat with the next; influencers tell viewers to follow TimeLiners on TikTok. Scaling: (1) increase budget and target bigger creators, or (2) sign creators as dedicated "TimeLiners creators". Wants a very simple PDF of the plan for the investor meeting, with simple TimeLiners branding

---

## SUPABASE TOOLING NOTES

- `cron.unschedule()` requires exact job name string or numeric `jobid`; query `cron.job` to confirm before acting
- DROP function before recreating when renaming parameters (Postgres keeps old signature otherwise)
- `REVOKE EXECUTE FROM PUBLIC` (not just anon/authenticated) to fully lock down functions
- `execute_sql` for reads; `apply_migration` for DDL/recorded schema changes
- Edge function secrets cannot be set via MCP, Supabase dashboard only
- Storage deletions require Storage API, not SQL
- `expires_date` is a generated column; never insert/patch it directly
- Log queries: use `event_message like '% | 200 |%'` pattern for status codes
- `net.http_post` timeout must be set explicitly (default 5s too short for AI edge functions)
- Analytics: GA4 installed (Measurement ID: G-H5CS34QY2Y)
- `execute_sql` does not reliably persist GRANT/REVOKE or other privilege/DDL changes (silently no-ops); always use `apply_migration` for grants too
- Supabase's default privilege template gives anon/authenticated/service_role table-wide GRANT ALL the instant a table is created; RLS is the access-control layer. A column-level `REVOKE SELECT (col) FROM anon` is a silent no-op in that case. To restrict one column: `REVOKE SELECT ON table FROM anon;` then `GRANT SELECT (explicit, col, list) ON table TO anon;` (future new columns then fail closed unless explicitly granted)

---

## TIMELINERS PLATFORM (main file)

- Portfolio platform for video editors and motion designers (Behance model), NOT a marketplace. Editors build portfolios and share links organically
- Long-term goal: in-platform marketplace where clients and editors message, make deals, share work, and transact; TimeLiners takes 20% cut of each deal
- Built as a single-file HTML/JS/CSS application, deployed on Netlify via GitHub; whole app is one big IIFE. Any function called from an inline HTML onclick/onchange MUST be added to the `window.X = X;` exposure list near the end of the script or it throws "X is not defined" despite valid JS (shipped as a real bug once; always check this list when adding new onclick-invoked functions)
- Backend: Supabase (project ID `xilhrpbqdqocpwxaigvy`) for DB, auth, and edge functions; on Pro plan (about $25/mo) for egress headroom and daily backups. Weekly automated pg_dump backup via GitHub Actions, gzipped, to private Cloudflare R2 bucket (`timeliners-backups`), 60-day retention, size-check safety guard
- Media storage: Cloudflare R2, `timeliners-videos` bucket. Videos served through a Cloudflare Worker gatekeeper (`timeliners-video-gatekeeper`, checks Referer/Origin against timeliners.lk) at `timeliners-video-gatekeeper.info-timeliners.workers.dev`. The old fully public r2.dev URL is kept enabled in parallel. Images (covers/avatars) deliberately still served from the plain public R2 domain (`pub-902baa20af1b466dbe58a28e6bc705e7.r2.dev`), since they need to be fetchable with no Referer (WhatsApp/FB link previews, search indexing)
- Transactional email: Resend, sent from `noreply@timeliners.site`; edge function `send-email` handles all templates. Public contact email is `contact@timeliners.lk`; `info.timeliners@gmail.com` is the older contact/test address
- File naming: main site is `index.html` (no version suffixes); finance file is `finance.html`. When given a new index.html upload, verify it's actually current (line count and presence of newer features, e.g. the "Why Pro?" carousel widget); a stale upload was mistakenly edited once (Sep 2026)
- 8 security markers to ALWAYS verify on any new index.html upload before treating it as current: Cloudflare Turnstile on signup, device-trust OTP login (`trusted_devices` table), HEIC/HEIF to JPEG auto-conversion on image pickers, `escHtml()` XSS-escaping throughout, technical error toast system (`#err-toast`), `AbortController` fetch timeouts, correct skeleton shimmer CSS vars (`--skel-a`/`--skel-b`), DOMContentLoaded race-condition fix
- Storage: 1GB flat per profile for all accounts, permanent, do not revert without Kaveesha explicitly requesting. Free plan: unlimited projects, public profile, social links, Hire Me button, analytics, brand color picker. UPDATE Oct 4, 2026: Skills, Services and pricing plans are NOT live (hidden in the dashboard); make no changes to them. Policy: projects can NEVER be published without at least one video (cover alone insufficient), applies to create and edit, never revert
- Admin panel removed. Kaveesha manages payments/users/plans manually via finance.html / Supabase dashboard
- Client-side video compression via ffmpeg.wasm producing 720p HQ + 360p LQ variants (`video_urls_lq` column, CRF 26/720p cap for HQ), `-movflags +faststart` applied; quality picker on project detail. The live "Upload Project" modal (`upmVideoFilePicked`) calls `compressVideoFile()` + HEVC-track detection before upload. Gated by client-side `isValidMp4File` first (`.mp4` + type empty or exactly `video/mp4`)
- Feed uses ranked algorithm: engagement x recency decay x a flat 1.2x Pro-author boost (`rawScore()` in `loadFeed()`). Client-side 5-min sessionStorage feed cache. Video plays on hover (desktop) / scroll (mobile, IntersectionObserver). Batched incremental rendering (9 cards/batch)
- Signature platform animation (all new UI): springy pop-in, transform/opacity only (translateY+scale), bounce easing `cubic-bezier(.34,1.56,.64,1)`, no layout properties. Used for the shared `popIn` keyframe (modals, dropdowns). NOT used for full-page transitions
- Core UI design principle for all new boxes/cards: filled background (`--bg2`/`--bg3`/`--bg4`) with `border:1px solid transparent` (no visible stroke by default, only on hover/focus); moderate corner radius (`--r`/`--rlg`/`--rxl`), never sharp, never a full pill on a content box. Reuse existing classes (`.fsrch`, `.sort-cdd-btn`, `.faq-cta-box`) rather than new custom CSS
- Kaveesha dislikes dashes in user-facing copy: originally just the em-dash, and as of Sep 2026 every dash including hyphens in compound words (asked "every dash, even the little ones" removed from the legal pages). Ongoing standard for any new user-facing text (code comments are fine, only visible strings matter)
- **Pro plan (Sep 2026): one time LKR 7,990 lifetime purchase, no recurring tiers, no expiry, activated manually via finance.html only (no payment gateway).** Bundle: custom main+sub fonts (10 curated Google Fonts each), custom accent color, verified/Pro badge, hide "Made with TimeLiners" branding, availability-status badge (open/fulltime/parttime/unavailable). Pricing page shows a single "Pro Lifetime" card (green "LIFETIME ACCESS" pill badge) next to Free; headline just "Pricing". `isProPlan()`/`viewedIsPro`/`profIsPro` recognize `pro-lifetime` (plus legacy `pro`/`pro-yearly`/`standard`/`vip`). Dashboard/account Pro card and copy renamed to "Pro Lifetime". "Why Pro?" floating carousel final slide and CTA updated to lifetime language. DB: `payments.expires_date` is a generated column returning NULL forever for `plan='pro-lifetime'`; `payments.plan` check constraint allows `pro-lifetime`. The `check-expired-pros-daily` cron job was unscheduled (jobid 15). `send-email` (v32) has `expired`/`downgraded`/`renewed` templates removed; `pro_confirmed` is a short celebratory email with a "Go to Customize Tab" CTA. finance.html: `mm-plan` dropdown offers only Free / Pro-lifetime (LKR 7,990) for new grants, plus a historical-backfill dropdown with legacy options; `PL`/`PP`/`isPro`/`calcExpiry()` handle `pro-lifetime`; fixed a bug in `confirmSlip()` referencing undefined `pf` instead of `pf0`. finance.html's `syncOverdueStatus()` still has dead-but-harmless references to old expired/downgraded email types
- Earlier Pro pricing history (superseded): LKR 2,490/mo, then 990/mo, then a recurring relaunch at LKR 1,490/mo or 14,900/yr shipped Sep 2026 with a Monthly/Yearly toggle. Reasons for abandoning recurring: target users are casual/part-time editors with high churn (about 4 month average tenure), Pro features cost nothing extra to grant permanently, and Sri Lankan buyers respond better to an upfront one time purchase. No Pro members existed under either scheme
- `payments` table schema: id, user_id, plan, amount, pay_status (`pending`/`paid`/`rejected`/`overdue`/`downgraded`), slip_url, member_no, notes, wa, submitted_at, paid_date, `expires_date` (generated), created_at. RLS: service_role full access + authenticated scoped to the admin email (finance.html login) + `owner_select_own_payments` letting users read their own row
- Big Update is done and live (Sep 2026): Google OAuth login, the new UI overhaul, and the scrapped sponsor-ads cleanup shipped
- Pending tasks: (1) split index.html into organized separate files, (2) remove orphaned unused `videos.timeliners.lk` custom domain on the R2 bucket, (3) design and build a protected path for cover images/avatars (gatekeeper-style but still allowing no-Referer access for link previews/search), a prerequisite before the old public r2.dev URL can be disabled, (4) build a `profiles_public` view excluding `contact_phone` and point anon `select=*` reads at it
- Sep 27, 2026 site-wide outage (about 1 day): `promo_card_dismissed_at` column (added Sep 26) was never added to the anon column-level SELECT allowlist from the Sep 10 migration, so any `select=*` PostgREST call from anon hit "permission denied for table profiles". Hit every public profile page and the sitemap. Fixed same day with a blanket `GRANT SELECT ON profiles TO anon`. Tradeoff: this re-exposed `contact_phone` to public reads (5 of 498 users have one stored). Decision pending: revoke just that column again vs build a `profiles_public` view (safer, recommended)
- "Sign In" renamed to "Log In" across platform UI (Sep 2026)
- Security check (Sep 2026): index.html has no exposed secrets (only the public Supabase anon key and Turnstile site key); engagement RPCs (hire/social/view/playback-error) IP-rate-limited; `profiles`/`projects`/`saved_projects`/`trusted_devices` RLS scoped to `auth.uid()`; `admin_otp_codes`/`click_rate_limit` with zero RLS policies (deny-all) is intentional. Fixed: `analytics_events` had a public "Anyone insert" policy; replaced with owner-only insert. Noted but left: unused singular-named duplicate RPCs (`increment_hire_click`, `increment_social_click`) and a leftover `increment_ad_impission`/`sponsor_ads` RPC from the scrapped ads feature
- Considered and parked: httpOnly-cookie session storage (not urgent, no known XSS bug, multi-day task). Rejected: bloom filter for username checks (not needed at this scale, not a security feature)
- Netlify: newer credit-based plan (300 credits/month shared across all sites incl. staging; each production deploy costs a flat 15 credits). Staging site: `timeliners-staging.netlify.app` (site id `3dab3328-fa0a-4c7c-99b1-500eed2bf2aa`), deployed via drag-and-drop on its Deploys page. Batch staging tests into complete rounds
- The plan to move off Supabase to Neon + Cloudflare Workers is cancelled (Sep 2026); staying on Supabase
- History: started as a two-sided marketplace (Fiverr-like) for Sri Lankan editors and clients, then pivoted to pure portfolio platform. Feedback pattern from TikTok/WhatsApp: almost every editor who messages Kaveesha brings up getting clients. Competitor studied: Framefolio (India, 99 rupees/mo); TimeLiners advantages are custom domain potential, profile theme/color control, portfolio categorization; Framefolio has software tags, niches, available-for-work toggle, showreel, testimonials
- Security/perf hardening done (Sep 2026, don't re-audit from scratch): RLS tightened across profiles/projects/analytics_events; rate-limiting on all engagement RPCs; `mark_newsletter_sent` locked to service_role; all 12 edge functions reviewed and locked down; `notify-inquiry` HTML-escapes client fields; R2 video serving behind the gatekeeper; `deleteProject()` R2 key-matching storage-leak fixed (41 orphaned rows/about 724MB cleaned up); CSS `inherit`-in-font-family bug fixed; double video load in `tlInitQuality()` fixed
- Pricing page polish round 2 (Sep 2026): plan labels semibold; Pro/Free card buttons swap via `renderPricingButtons()` ("Get Started"/"Your Current Plan"/"Switch to Free" routed to a WhatsApp deep link via `handleFreePlanClick()`); removed the small "FAQ" eyebrow label on the FAQ page; "Why Pro?" final slide: "LKR 7,990 once, and it's yours forever. No subscriptions, just one of the smartest investments you can make in your career." with CTA "Get Started"
- Pricing page subtext (Sep 2026): "Between editing software, storage plans, and stock libraries, editors already deal with enough subscriptions. This isn't one of them."
- Copywriting rules: never use the word "juggle"; remove hyphens in "one time" ("one time"/"One time"), applied across customize-lock overlay, upgrade WhatsApp message, pricing-note, FAQ answer
- Dashboard plan-card round 3 (Sep 2026): Free-user card lists Pro features and ends with "all for just LKR 7,990/once". Pro-user card fetches the user's actual `paid_date` from `payments` and shows "You purchased TimeLiners Pro on [date]. Enjoy your Pro features." Buttons: "Get Pro Lifetime" (WhatsApp) for Free, "Customize" for Pro
- Verified/Pro badge belongs on the dashboard overview profile card (`#ov-name`) only, via `proBadgeSpan()` + `escHtml()` in `refreshDash()`; removed from the "Welcome back, X" header. Alignment fixed with an inline-flex wrapper and raw `proBadgeHtml(18)`
- Free-card button for Pro users renamed from "Downgrade" to "Switch to Free" (WhatsApp message: "I want to switch my TimeLiners account to the Free plan")
- Fixed mobile project-modal backdrop sliver (single scroll container, `overscroll-behavior-y:contain`, `100dvh` on `#proj-modal-overlay`). Kaveesha wants the overlay's `rgba(0,0,0,.93)` backdrop kept as is
- Fixed latent bug: `tlVideoError`, `tlToggleQMenu`, `tlSetQuality` were never added to the `window.X` list, so the quality picker and "can't play" message never ran in production. Now exposed
- Automatic unplayable-video detection + burying: `tlWatchPlayback()` watchdog (about 4.5s) flags playback that starts but never advances; failures call `report_video_playback_error(p_id)` (rate-limited via `click_rate_limit`, 5-min window per IP), incrementing `projects.playback_fail_count`. Feed ranking: 1 report = 0.1x penalty; 2+ reports = quarantined, appended after everything in every sort mode
- Fixed blank feed thumbnails: `pcardFallbackHtml(bg)` branded gradient + icon placeholder behind every thumbnail layer in `buildCard()` and `buildProfilePCard()`
- Feed ranking improvements: quality-signal multiplier (real title + description + cover, up to 1.45x); graduated weekly penalty for old underperforming projects (under 1 week none; 1-2 weeks 0.9x; 2-3 weeks 0.75x; 3+ weeks 0.55x; never zeroed); Pro absorbs half the staleness penalty; `_hasGoodTitle()` excludes generic titles ("Video Edit", "Reels Test", "Test", "Untitled"); "new project floor" guarantees at least one project from the last 48h in the first 10 cards
- Every future index.html handoff must be a single, already obscured file ready to deploy as is: always minify (esbuild, strips comments + shortens variable names) and strip console.log/warn/error before handing back, and only ever deliver one file named index.html. (Note: this was the standing rule for deploy-ready handoffs.)
- Fixed: `tlReportPlaybackError()` had no environment guard, so file:// local testing reported every video as broken to production. Added `_tlIsProdSite()` (only timeliners.lk/www.timeliners.lk report). Reset 20 falsely flagged projects
- Created Netlify staging site `timeliners-staging.netlify.app`; video playback fails there unless the gatekeeper Worker's allowed origins include it
- A failed automatic thumbnail frame-grab (project with no cover_url) reports as a playback failure immediately; watchdog waits 3.5s after `loadedmetadata` for `seeked`, still gated by `_tlIsProdSite()`
- Found and removed a leftover ~2,300 char HTML comment (outside any `<script>`, so minification missed it) containing the full original Supabase setup SQL. Lesson: before shipping, scan for large HTML `<!-- -->` comments over about 150 chars
- Profile availability badge (`#prof-avail-badge`) fade-in delay changed from 3s to 1s
- Fixed why new video uploads still returned old r2.dev links: edge function `r2-sign-upload` builds URLs from env var `R2_PUBLIC_URL`. Fix deployed (r2-sign-upload v27): only video URLs go through the gatekeeper; covers/avatars still return the public link on purpose
- Old public r2.dev link was disabled twice and broke things both times (first video playback, later all cover thumbnails, because covers/avatars depend on it). It cannot be disabled until covers get their own protected path. Re-enabled
- Current full source of `timeliners-video-gatekeeper` is in the GATEKEEPER section below
- Rewrote the gatekeeper Worker to add HTTP Range support (206 Partial Content); videos load faster. Seeking bug confirmed fixed (binding name `VIDEO_BUCKET`)
- Planned/built: rate-limit/abuse email alert system (see Sep 26 entry)
- Fixed orphaned divider above "Powered by TimeLiners" when branding is hidden (`#prof-badge-divider`)
- Feed scroll polish: card fade-in `IntersectionObserver` loosened to `threshold:0.01, rootMargin:'600px 0px 600px 0px'`; infinite-scroll trigger stays at 800px; `#feed-load-more` spinner stays unused/hidden
- Fixed "thumbnail disappears and reappears" for projects with video but no cover_url: thumb video starts `opacity:0` and fades in on `onseeked`
- Fixed "have to refresh to see it" for profile edits: `saveProfile` and `saveAccountDetails` now clear `s._profileCache` and re-render the live profile via `Ve()` if viewing the same user
- Legal pages (terms.html, privacy.html, refund.html at /terms, /privacy, /refund) revised Sep 2026: sponsored placements paragraph removed, all dashes removed, text should look as serious as Behance's legal page (Poppins), grey band behind title/policy switcher replaced with the plain page colour
- GitHub repo: `infotimeliners-lk/timeliners.platform` (main). Root holds index.html, terms.html, privacy.html, 404.html, maintenance.html, `_redirects`, `netlify.toml`, robots.txt, favicon, og-image, plus folders `finance/`, `netlify/`, `supabase/`, `.github/`. index.html on GitHub main (Sep 19, 2026) is unminified, 9813 lines, 562 KB
- Save button replaces the old Like button (Sep 2026): like counts carry on as save counts; saves are private; meant for clients. Every page/route name (feed, pricing, faq, terms, privacy, refund, etc.) must be blocked as a username. Account deletion message should say backups are purged within 60 days
- Saving a project requires a free account for clients too (intended)
- Sep 19, 2026: storage usage must be correct for every editor and all future uploads (one editor's was undercounted because older uploads had no `storage_usage` records)
- Before the flat 1GB policy, Pro members had 5GB
- Sep 20, 2026 follow-up round: portfolio opened in a new tab showed the feed first; errors too generic; sign up errors should sit under the relevant field (password, username, terms checkbox); add a lost internet UI in the style of Pinterest's in TimeLiners colours ("oh no, it looks like you lost your internet"), not a copy
- Sep 21, 2026: wants a newsletter announcing Pro Lifetime; sample first to itzkaveesha@gmail.com only. The "pro mail" has been sent to TL-001 through TL-043
- Sep 21, 2026: Google search results show the favicon inside a white ring/border; wants it fixed. Brand colour #fe730a, brand font Poppins. Old favicon set (android-chrome 192/512, apple-touch-icon, favicon.ico, 16x16, 32x32) was a full bleed orange gradient square with the "TimeLiners" wordmark in white
- Sep 21, 2026 feed asks: slow/dropped internet must never count as a broken video; same account projects should not sit close together; Pro projects at least 3 apart
- Sep 21, 2026: removed Nudge and Newsletter features from the finance page; file is finance.html
- Sep 21, 2026: the shimmer loading placeholder on feed thumbnails is intentional; never replace or remove it; fix the cause when thumbnails look wrong
- Sep 24, 2026: edge caching added to the gatekeeper Worker; deal with the old public r2.dev link later
- Sep 25, 2026: wants a reminder to turn off the old public r2.dev link once covers and avatars have their own home. Gatekeeper caching is live (`X-TL-Cache: HIT`)
- Sep 25, 2026 security pass: `payment-slips` bucket was public, now private (15 existing files still need deleting via the dashboard Storage); `bug_reports` policies fixed (admin/service-role only); BEFORE UPDATE triggers stop users changing their own `plan`, `pay_status`, `verified`, `featured`, `timmy_unlimited`, `timmy_marketing_unlocked`, `member_no`, `hidden` on profiles and `featured`/`author_plan` on projects (unless admin or service_role)
- Sep 25, 2026: profiles table is publicly readable (`public_read`, qual=true). `email` and `wa` are intentionally public (Hire Me fallback). Fixed index.html own-profile fetches to use the real session token; narrowed username lookups (`ge()`, `tlPre()`) to a safe column list. The DB column lock (REVOKE SELECT on `contact_phone`, `pay_status`, `pay_due`, `member_no`, `hidden`, `timmy_unlimited`, `timmy_marketing_unlocked`, `timmy_questions_used` from anon) is deferred until Kaveesha says she deployed the fixed index.html (then apply it immediately). Residual risk: an authenticated user could still read those for others without a `profiles_public` view split. (Oct 2: the contact/profile column lock is postponed, "do those later")
- Sep 26, 2026: wants prd.md and architecture.md reference docs built and kept as living documents
- Sep 27, 2026: built the Instagram-style Pro upgrade card in the feed (`#pro-promo-wrap`, above `#feed-grid`) for logged in free users; `promo_card_dismissed_at` timestamp column migration; "Not now" hides it for 3 weeks; "Upgrade to Pro" routes to pricing. Delivered as index.html, not yet deployed at the time
- Sep 26, 2026: rate-limit/abuse email alert system live: `check-auth-anomalies` edge function + `auth_alert_state` table + pg_cron every 15 min. Real auth_logs column is `source`; GoTrue `error_code` field used. Emails info.timeliners@gmail.com via Resend when 20+ failures in 15 min, max one email per hour. Secrets set: `LOGS_PAT`, `PROJECT_REF`, `SERVICE_ROLE_KEY`, `ALERT_EMAIL`, `CRON_SECRET`, `RESEND_API_KEY`
- Cookie policy/consent work stopped/paused
- Sep 29, 2026: wants YouTube style rich link previews on WhatsApp: project link shows the video thumbnail, profile link shows the avatar, main link shows the TimeLiners logo
- Oct 1, 2026: leftover R2 files from past account deletions are parked; make future account deletions remove all of the user's R2 files. `delete-account` edge function (v4, Oct 1) removes R2 files, legacy Supabase avatars and payment slips before deleting DB rows
- Oct 2, 2026: plans to buy Resend Pro and Netlify Pro before the influencer campaign. Editors' contact details are public on purpose; the other profile columns are "money stuff". Manual Pro payment via WhatsApp/finance.html is fine for now
- Oct 2, 2026: covers custom domain work and contact/profile column lock postponed. Wants a simple scale plan PDF for the investor (Netlify CDN, feed loads light data first then heavy, client side video compression, videos stream without fully loading) plus costs (Supabase Pro, Resend Pro, Cloudflare pay as you go, Netlify Pro), showing each service's current plan, what traffic it can handle, and what to upgrade when
- Oct 2, 2026: built automatic database load alert: edge function `check-db-load`, cron every 5 min, table `db_load_state`; emails ALERT_EMAIL when CPU 80%, memory 90% or connections 80% stay high for 2 checks in a row (`?test=1` sample email, `?debug=1` readings). Supabase compute is t4g.micro in Mumbai (60 connection limit). Netlify is on the free plan and fine for now
- Oct 3, 2026: asked to fix (1) a newly uploaded project not showing until refresh, (2) laggy video playback when opening a project's video

---

## GATEKEEPER WORKER (Cloudflare, timeliners-video-gatekeeper)

Deployed Sep 25, 2026 with edge caching (full video cached, Range requests sliced from the cached copy, `CACHE_ENABLED` switch, `X-TL-Cache` header HIT/MISS/OFF). The source is in the separate file timeliners-gatekeeper-worker.js, sent alongside this backup.
