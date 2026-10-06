# TimeLiners — Product Requirements Document

## 1. Overview

TimeLiners (timeliners.lk) is a portfolio platform for video editors and motion designers, built on a Behance-style model rather than a marketplace or gig-work model. Editors build a public portfolio and share it organically; clients discover editors and reach out directly. Founded and operated solo by Kaveesha, a former freelance video editor, based in Sri Lanka.

## 2. Problem and target users

Video editors, especially in Sri Lanka, lack a dedicated professional home for showcasing work with real client-facing discovery. Recurring customer feedback pattern from TikTok and WhatsApp: almost every editor who reaches out mentions wanting help getting clients. That is the core need TimeLiners is built around.

## 3. Product positioning

- Not a two-sided marketplace. TimeLiners started as one (Fiverr-like, for Sri Lankan editors and clients) and deliberately pivoted to a pure portfolio platform.
- Competitor studied: Framefolio (India, ₹99/mo). TimeLiners' current advantages: custom domain potential, profile theme and accent color control, portfolio categorization. Framefolio's advantages: software tags, niche tags, an available-for-work toggle, showreel, testimonials.
- Long-term, not yet built: an in-platform marketplace where clients and editors can message, negotiate, and transact, with TimeLiners taking a 20 percent cut. This is a direction, not a committed roadmap item.

## 4. Core features (current, live)

### Accounts and auth
- Email and password, plus Google OAuth
- Device-trust OTP login (`trusted_devices`)
- Cloudflare Turnstile bot protection on signup

### Profiles
- Username-based public profile page
- Bio, role, city, social links, Hire Me button
- Availability status badge (open, full time, part time, unavailable) — Pro feature
- Skills and Services tabs — free
- Custom brand accent color — Pro feature (font and color customization are Pro; the Skills/Services tabs and Hire Me button themselves are free)
- Verified/Pro badge

### Projects and portfolio
- Upload with client-side compression (ffmpeg.wasm) producing a 720p HQ and 360p LQ variant of every video, with fast-start encoding
- Automatic HEIC/HEIF to JPEG conversion on image pickers
- Cover image, or an automatically generated frame grab when no cover is set
- Title, description, category, tags
- Policy: a project can never be published without at least one video; a cover image alone is not sufficient. Applies to both creating and editing a project.
- Draft or published status
- Save (replaces the old Like button): private per-viewer list, intended for clients bookmarking editors' work; saving requires a free account

### Discover feed
- Ranked algorithm blending engagement, recency decay, and content-quality signals (see architecture.md for the mechanics)
- Sort modes: ranked ("algorithm"), newest, popular, views, and search
- Automatic detection and quarantine of unplayable/broken video uploads, with a genuine slow connection never counted as broken
- Infinite scroll with batched rendering
- Storage: a flat 1GB per profile for every account, regardless of plan (previously Pro accounts got 5GB; simplified to flat storage)

### Pro Lifetime plan
- LKR 7,990, one-time purchase, no recurring billing, no expiry, granted manually via finance.html (no payment gateway integration)
- Features: custom main and sub fonts (10 curated Google Fonts each), custom accent color, verified/Pro badge, ability to hide "Made with TimeLiners" branding, availability-status badge
- Pricing history: started at LKR 2,490/mo, tried 990/mo, then a recurring 1,490/mo or 14,900/yr model was built and nearly shipped before being replaced with the lifetime model. Reasoning for lifetime over recurring: target users are casual or part-time editors with high churn (roughly 4-month average tenure), Pro features cost nothing extra to grant permanently, and Sri Lankan buyers respond better to an upfront, impulse-sized purchase than to a subscription they are likely to cancel.

### Admin and finance
- No in-app admin panel. Payments, plan grants, and user management are handled manually through finance.html and the Supabase dashboard.

## 5. Non-goals and parked ideas

- A "themes" monetization feature (custom profile themes/storefront) was fully built, then killed; the platform reverted to its classic single look.
- Sponsored ads/placements were considered and scrapped; not part of the product.
- The in-platform marketplace (messaging, deal-making, 20 percent cut) remains a long-term idea only, not scheduled work.

## 6. Roadmap and pending items

- Split the single index.html file into organized, separate files. This is a maintainability improvement for development speed, not a user-facing or performance issue.
- Retire the old public r2.dev link for media once cover images and avatars have their own protected, no-Referer-friendly delivery path (mirroring the video gatekeeper).
- Harden `contact_phone` and other admin-only profile columns against direct authenticated-user API access (a `profiles`/`profiles_public` view split would close this properly).
- Build a rate-limit and abuse alert system (auth failures, password reset spikes) once Supabase's log query API stabilizes post-migration.

## 7. Brand and copy standards

- Brand color: `#fe730a`. Brand font: Poppins.
- No dashes anywhere in user-facing copy: no em-dashes, and no hyphens, including in compound words like "one time." Code comments are exempt.
- Avoid the word "juggle" in any TimeLiners copy.
- Signature UI motion: a springy pop-in (translateY plus scale, bounce easing), used for modals and dropdowns, deliberately never used for full-page transitions.
- Visual convention for new UI: filled backgrounds with a transparent border by default (border only appears on hover/focus), moderate corner radius, never sharp corners and never a full pill shape on a content box.

## 8. Current scale (reference point, September 2026)

- 367 published projects, 496 profiles
- Growth accelerating: roughly 80 to 100 newly published projects per month recently, up from roughly 30 to 40 a few months earlier
- At this pace, the platform is not close to any real technical ceiling; see architecture.md for the feed scalability work done to keep it that way.
