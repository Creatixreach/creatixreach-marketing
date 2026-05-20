# CreatixReach Marketing Site — Build Spec

> **Hand this entire file to Claude Code.** Tell it: *"Read CREATIXREACH_MARKETING_SITE_BUILD_SPEC.md and build the site exactly as described. Ask before any deviation."*
>
> **Owner runs the PowerShell + Cloudflare + Vercel steps in Section 14 personally.** Claude Code does not touch DNS or production deploys without owner approval.

---

## 0. TL;DR (read this first, 60 seconds)

**What:** A new, standalone, animation-heavy agency marketing site at `creatixreach.io` (the apex).

**What it is NOT:** The existing portal at `app.creatixreach.io` is **off-limits.** Different repo. Different Vercel project. Different deploy. The marketing site never reads from the portal's database, never imports its components, never references `app.creatixreach.io` except as an outbound link.

**Why:** The current Hostinger-AI site at `creatixreach.io` is boring and unprofessional. Owner wants a cinematic, scene-based experience where each service is its own immersive 3D-ish room with its own ambient sound, and the user navigates with arrow keys / scroll / swipe.

**Conversion goal:** Two CTAs per scene — green WhatsApp button (`wa.me/13232978843` with a prefilled message per service) and an indigo "Send Brief" form with a service dropdown. Email lands at `info@creatixreach.io` + `ADMIN_NOTIFICATION_EMAIL` via Resend (same pattern as the portal's `/contact` route).

**No login. No DB. No auth.** Pure marketing + lead capture.

---

## 1. Brand context (inherited from portal)

The owner already has a brand system from the portal project. Reuse it exactly.

| Token | Value |
|---|---|
| Primary navy | `#0f172a` |
| Primary indigo | `#4f46e5` |
| Accent green (WhatsApp CTA) | `#25D366` (official WhatsApp brand green) |
| Text on dark | `#f8fafc` |
| Muted on dark | `#94a3b8` |
| Logo mark | Bold capital **C** with phone-receiver bulbs at the terminals + speaker-grill dots inside (vanish at favicon size, emerge at 96px+) |
| Wordmark | **CreatixReach** (extracted from owner's logo, transparent bg, white + black variants exist) |
| Fonts | Geist Sans (UI), Geist Mono (the 010101 code rain). Self-hosted via `next/font/local` — same approach as portal. |
| Tagline | **"We run the whole stack. Digital solutions, built end-to-end."** |
| Market | **US LLC, customers in US and Europe.** All copy is English, professionally written for US/EU B2B buyers. No regional accents or idioms. US-style address/phone formatting where used. Use $ for any pricing references. |

**Brand asset copy step (one-time, owner does this in PowerShell — see Section 14.A):**
Copy these from the portal repo's `public/` folder into the new site's `public/` folder:

- `icon.svg`
- `icon-192.png`, `icon-512.png`
- `logo-wordmark-white.png`, `logo-wordmark-white-2x.png`
- `logo-wordmark-black.png`, `logo-wordmark-black-2x.png`
- `icon-circle-light.png`, `icon-circle-light-2x.png`
- `apple-icon.png` (or regenerate from `icon.svg`)

If anything is missing, ask the owner before improvising new assets.

---

## 2. Architecture (isolation is non-negotiable)

```
                creatixreach.io  (apex)
                       │
                       ▼
   ┌────────────────────────────────────────────┐
   │  NEW Vercel project: creatixreach-marketing │  ← THIS BUILD
   │  Next.js 14 App Router · No DB · No auth   │
   │  Resend for contact form (existing API key)│
   └────────────────────────────────────────────┘

                app.creatixreach.io
                       │
                       ▼
   ┌────────────────────────────────────────────┐
   │  EXISTING Vercel project: creatixreach-portal  │  ← DO NOT TOUCH
   │  Clerk + Supabase + Prisma + VICIdial bridge │
   └────────────────────────────────────────────┘

   *.dialer1.creatixreach.io  ← per-customer VICIdial subdomains, untouched
   dialer.creatixreach.io     ← legacy admin, untouched
```

Both projects live in the same Vercel org (`Creatixreach's Org`) and share the same Cloudflare zone (`creatixreach.io`). They are otherwise fully independent.

---

## 3. Tech stack (exact)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14, App Router** | Same as portal, owner-familiar, Vercel-native, server actions for the contact form |
| Language | TypeScript strict | Match portal |
| Styling | Tailwind CSS + CSS variables | Match portal |
| 3D / WebGL | **`three` + `@react-three/fiber` + `@react-three/drei`** | The agreed cinematic look |
| Animation | **`framer-motion`** | Scene transitions, text reveals, UI |
| Sound | **`howler`** | Cross-browser, supports sprites, fade in/out |
| Form delivery | **Resend** (existing API key) | Same as portal, one less account to manage |
| Validation | **`zod`** | Match portal pattern |
| Icons | **`lucide-react`** | Match portal |
| Fonts | `next/font/local` with Geist Sans + Geist Mono | Match portal |
| Analytics | **Vercel Web Analytics** | Match portal, free |

**Package install command for Claude Code:**

```bash
pnpm add three @react-three/fiber @react-three/drei framer-motion howler zod resend lucide-react
pnpm add -D @types/three @types/howler
```

Use `pnpm` not `npm`. Match the portal.

---

## 4. Site map

```
/                  → Cinematic experience (5 scenes, arrow/scroll/swipe nav)
/contact           → Standalone contact form (also linked from every scene)
/classic           → Optional: a static, no-3D fallback summary page (Phase 2)
/api/contact       → Server action endpoint for the form
robots.txt, sitemap.xml, opengraph-image.png, twitter-image.png
```

The 5 scenes on `/`, in order:

1. **Scene 0 — The Coding Room** (hero / intro / audio gate)
2. **Scene 1 — Web Creation & Social Media**
3. **Scene 2 — Systems, APIs, Automations & Integrations**
4. **Scene 3 — Telemarketing & Call Center Setup** (the CreatixReach Dialer product)
5. **Scene 4 — Cold Calling & Lead Generation**
6. **Scene 5 — Final CTA + Footer** (recap + contact form embed)

---

## 5. Scene-by-scene design

Each scene fills the viewport. Each scene has:

- A full-bleed 3D canvas (or 2D canvas in Lite mode)
- A floating glass-morphic UI panel with: scene number "01 / 05", service title, 2-line value prop, 3 bullet points, two CTA buttons (WhatsApp green + Send Brief indigo)
- Persistent top-left logo, persistent top-right "Send Brief" link, persistent bottom-center arrow hints ("← prev · → next")
- A subtle ambient audio loop (muted until the audio gate is unlocked)
- A scene-specific hover sound on CTAs (soft click)

### Scene 0 — The Coding Room (hero)

**Vibe:** You wake up inside a dark room. The walls are made of slow-falling 010101 code rain (Matrix style but indigo + white, not green). Three holographic CRT monitors float in the air around you, each showing different scrolling code (terminal output, a browser inspector, a call-flow diagram). Subtle camera parallax follows the cursor.

**Audio gate:** Center-screen modal on first load — *"Enter the room"* button. Click → unlocks `AudioContext`, starts the ambient loop, fades in the typing sounds, then the modal dissolves. Without this, the rest of the site is silent (still animated, but no audio).

**Copy:**
- Headline: **"We run the whole stack."**
- Sub: *"Digital solutions, built end-to-end. Websites. Systems. Call centers. Leads."*
- Bullets (animate in one at a time):
  - Websites & social that don't look like everyone else's
  - APIs, automations, integrations — the boring plumbing that scales
  - Predictive dialers + cold-calling campaigns we actually run
- CTAs: **WhatsApp Now** (`wa.me/13232978843?text=` + URL-encoded `Hi CreatixReach, I saw your site and want to talk.`) + **Send Brief** (anchor to `/contact?topic=general`)

**Sound:** Mechanical keyboard typing (very subtle, only when a CTA is hovered or every ~8 seconds as ambient) + low synth pad ambience.

### Scene 1 — Web Creation & Social Media

**Vibe:** A dark design studio at night, RGB ambient light on the walls. Three to four browser-window meshes float in 3D space, each cycling: wireframe → mockup → live site. Off to the side, a phone mockup rotates slowly showing Instagram / TikTok content. Particle lines connect the browser windows to the phone, suggesting cross-platform sync.

**Copy:**
- Title: **Web Creation & Social Media**
- Sub: *"Sites that ship, content that compounds."*
- Bullets:
  - Custom Next.js / WordPress / Shopify builds
  - Social media management — Instagram, TikTok, Facebook, LinkedIn
  - Content calendars, ad creatives, post scheduling
- CTAs:
  - WhatsApp: `wa.me/13232978843?text=` + encoded `Hi! I want to talk about a website / social media project.`
  - Send Brief → `/contact?topic=web-social`

**Sound:** Soft synth pad + occasional shutter-click on the rotating phone.

### Scene 2 — Systems, APIs, Automations & Integrations

**Vibe:** Translucent server racks lining a corridor, soft cyan glow seeping from inside. A holographic dashboard floats center-stage with animated API endpoint nodes lighting up as data flows between them. A 3D workflow diagram (think Zapier but spatial) materializes as little glowing cubes connecting with bezier curves.

**Copy:**
- Title: **Systems, APIs, Automations & Integrations**
- Sub: *"The plumbing professional companies actually need."*
- Bullets:
  - Custom internal tools, dashboards, admin panels
  - API integrations between the tools you already use
  - Workflow automation — webhooks, scheduled jobs, CRM sync
- CTAs:
  - WhatsApp: `wa.me/13232978843?text=` + encoded `Hi! I need help with a custom system / API / automation.`
  - Send Brief → `/contact?topic=systems`

**Sound:** Low server-room hum + occasional soft data-blip sounds.

### Scene 3 — Telemarketing & Call Center Setup (CreatixReach Dialer)

**Vibe:** A futuristic call-center floor at twilight. Rows of headset stations glow faintly along a curved horizon. A holographic call-flow visualization hovers center-stage with soundwaves emanating from agent silhouettes. A 3D world map shows calls lighting up in real time as arcs of light between cities.

**Copy:**
- Title: **Telemarketing & Call Center Setup**
- Pill above title: *"Our flagship product: **CreatixReach Dialer**"*
- Sub: *"We set up the floor, you start dialing."*
- Bullets:
  - Predictive dialer-as-a-service (hosted, isolated per customer)
  - SIP carrier + DIDs + agent training included
  - Live VICIdial-based dialer, billed per minute
- CTAs:
  - WhatsApp: `wa.me/13232978843?text=` + encoded `Hi! I want to set up a call center / try the CreatixReach Dialer.`
  - Send Brief → `/contact?topic=dialer`
- **Extra link:** small text below CTAs — *"Already a customer? Go to the dialer portal →"* linking to `https://app.creatixreach.io`

**Sound:** Distant agent-chatter ambience (very faint, multi-voice) + occasional dial-tone blip + subtle ringback.

### Scene 4 — Cold Calling & Lead Generation

**Vibe:** Night city skyline. Phone signals as arcs of light connecting buildings. "Leads" materialize as small glowing crystals that fly across the scene into a vault. An animated counter ticks up live (purely cosmetic — `useState` incrementing every 200ms with a randomized jitter, capped so it doesn't run forever).

**Copy:**
- Title: **Cold Calling & Lead Generation**
- Sub: *"We don't just hand you a dialer. We run the campaigns."*
- Bullets:
  - Targeted cold-calling campaigns we manage end-to-end
  - Lead lists, scripts, agent management
  - Pay for results, not effort
- CTAs:
  - WhatsApp: `wa.me/13232978843?text=` + encoded `Hi! I'd like to talk about a cold-calling or lead-gen campaign.`
  - Send Brief → `/contact?topic=cold-calling`

**Sound:** Tense pulsing low-frequency rhythm + occasional satisfying "lead-captured" chime when a crystal hits the vault.

### Scene 5 — Final CTA + Footer

**Vibe:** Camera pulls back to reveal all four service rooms as small floating cubes in a dark void, with the CreatixReach logo glowing center-stage. The hero "code rain" returns subtly in the background.

**Copy:**
- Headline: **"Pick a room, or just message us."**
- Quick 4-card recap (web, systems, dialer, cold-calling) — each links back to its scene
- Embedded `/contact` form (same component used at `/contact`)
- Footer with logo, "© 2026 CreatixReach", legal links (Privacy, Terms — placeholder pages OK for v1), social icons (placeholders if owner doesn't supply links yet)

---

## 6. Navigation system

**Inputs (all wired to the same scene-index state):**

- **Arrow keys** (← / →) — primary input, the user explicitly asked for this
- **Scroll wheel** — debounced, one scene per scroll event (300ms cooldown to prevent rapid skipping)
- **Touch swipe** (mobile) — `pointerdown` / `pointermove` / `pointerup` with a horizontal-threshold detector
- **Bottom progress dots** (5 dots, current one filled) — clickable to jump
- **Top-right menu** — dropdown listing all 5 scenes, clickable

**Transition:** Framer Motion `AnimatePresence` cross-fade + slight camera dolly on the 3D side. ~600ms total. Use `exit-then-enter` mode so two heavy 3D scenes are never mounted simultaneously.

**Persistent UI (never moves between scenes):**
- Top-left: Logo (links to `/`)
- Top-right: "Send Brief" text-button + a small audio-mute toggle 🔊/🔇
- Bottom-center: Scene index "01 / 05" + arrow hints
- Bottom-right: Floating WhatsApp button (always available, uses current scene's prefilled message)

**Reduced motion:** If `prefers-reduced-motion: reduce`, kill the 3D canvas entirely and render a vertical-scroll classic site (the same 5 sections, but in plain HTML with simple fade-ins). Section 11 covers this in detail.

---

## 7. Contact form spec (mirror the portal pattern)

The portal already has a working `/contact` route at `src/app/contact/page.tsx` + `src/app/contact/actions.ts`. **Read those files in the portal repo as the reference implementation** — the new site's form should follow the same shape with a slightly different field set.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | ✅ | min 2 chars |
| `email` | email | ✅ | RFC-ish regex |
| `company` | text | optional | |
| `phone` | tel | optional | for WhatsApp follow-up |
| `topic` | select | ✅ | Options: **General**, **Web & Social**, **Systems & APIs**, **Call Center / Dialer**, **Cold Calling / Leads**. Pre-selected from `?topic=` query param if present. |
| `budget` | select | optional | Options: <$1k, $1–5k, $5–20k, $20k+, "Not sure yet" |
| `message` | textarea | ✅ | 10–5000 chars |
| `_honey` | hidden | ✅ empty | Honeypot — bots fill it, real users don't |

**Server action `submitContactAction`** in `src/app/contact/actions.ts`:

1. Validate with `zod`. Reject if honeypot is non-empty (silently return success to fool the bot).
2. Build HTML email with `escapeHtml` on all interpolations. Table layout for Outlook compatibility.
3. Read `process.env.ADMIN_NOTIFICATION_EMAIL`.
4. Build recipients array: `["info@creatixreach.io", adminInbox]`, dedup if the same.
5. `resend.emails.send({ to: recipients, replyTo: customer.email, from: "CreatixReach <no-reply@creatixreach.io>", subject: \`[Marketing site] ${topic} — ${name}\`, html })`.
6. **Check `result.error` explicitly** — Resend can return 200 with an error object in the body (lesson from portal gotcha #167).
7. Log to Vercel runtime: `[marketing-contact] sending to <list>` then either `sent, id=<id>` or `resend error <details>`.
8. Return `{ ok: true }` or `{ ok: false, error: "Couldn't send. Please WhatsApp us instead." }`.

**Required env vars in Vercel for this project:**

```
RESEND_API_KEY=<copy from the portal project's env, same key>
ADMIN_NOTIFICATION_EMAIL=elhadad.design@gmail.com
```

**Resend "from" address:** `no-reply@creatixreach.io`. The DNS records for Resend are already set up in Cloudflare for this domain (the portal uses them). Verify in the Resend dashboard that the domain is `Verified` before sending the first email — if Resend was scoped to the portal only, the domain status carries over because it's at the apex.

---

## 8. WhatsApp integration (concrete URLs)

Phone number: **`+1 323 297 8843`** → `wa.me/13232978843` (strip + and spaces).

**Each scene's WhatsApp button URL:**

| Scene | URL |
|---|---|
| Hero | `https://wa.me/13232978843?text=${encodeURIComponent("Hi CreatixReach, I saw your site and want to talk.")}` |
| Web & Social | `https://wa.me/13232978843?text=${encodeURIComponent("Hi! I want to talk about a website / social media project.")}` |
| Systems & APIs | `https://wa.me/13232978843?text=${encodeURIComponent("Hi! I need help with a custom system / API / automation.")}` |
| Dialer / Call Center | `https://wa.me/13232978843?text=${encodeURIComponent("Hi! I want to set up a call center / try the CreatixReach Dialer.")}` |
| Cold Calling / Leads | `https://wa.me/13232978843?text=${encodeURIComponent("Hi! I'd like to talk about a cold-calling or lead-gen campaign.")}` |
| Floating button (uses current scene's message) | same per active scene |

Put the messages in a single `src/lib/cta-messages.ts` constant so they're editable in one place. Owner will tweak wording later.

All WhatsApp links open in a new tab with `rel="noopener noreferrer"`.

---

## 9. Performance budget & Lite mode (this matters)

Owner is a US LLC selling to US and European customers — both markets have plenty of mid-range Android and budget iPhone traffic, plus a chunk of corporate desktops on locked-down browsers (no WebGL flags enabled). A 10MB 3D site loses them.

**Hard performance budget:**

- First Contentful Paint < 2s on Slow 3G (Lighthouse mobile)
- Total JS bundle < 400KB gzipped (excluding `three` chunk, which is lazy-loaded)
- 3D canvas mounts only after scroll past hero OR after the audio gate is clicked, whichever first
- Each scene's 3D assets lazy-import via `dynamic()` with `ssr: false`

**Lite mode auto-trigger (any one of these):**

- `navigator.deviceMemory < 4`
- `navigator.hardwareConcurrency < 4`
- `prefers-reduced-motion: reduce`
- `navigator.connection.effectiveType` is `'2g'` or `'slow-2g'`
- User clicks the "🚀 Lite mode" toggle in the top-right menu

**Lite mode behavior:** no 3D canvases, no audio, replace each scene's WebGL with a high-quality 2D illustration (SVG or PNG — Claude Code generates these alongside the 3D versions, or uses CSS gradient backgrounds as a graceful fallback). All copy + CTAs identical. Arrow-key nav still works.

---

## 10. Accessibility

- All interactive elements reachable by Tab in a sensible order
- Visible focus ring on every focusable element (not the browser default — design one in indigo)
- `aria-label` on icon-only buttons (mute toggle, WhatsApp, etc.)
- All scene text content rendered as real HTML (even if visually hidden behind the 3D canvas) so screen readers and search engines can read it
- `<h1>` per scene, semantic landmarks (`<main>`, `<nav>`, `<section>`)
- ESC closes any open modal (audio gate, menu)
- Audio defaults to OFF — never autoplay sound
- Honor `prefers-reduced-motion` (see Section 9)

---

## 11. SEO

The 3D-heavy front-end fights SEO unless we plan for it. So:

- Every scene's text content (title, sub, bullets) is rendered in plain HTML on the server, then visually placed by the 3D layer. Search engines see real content.
- Per-route `<title>` and `<meta name="description">` via Next.js Metadata API.
- `opengraph-image.png` (1200×630) and `twitter-image.png` (same) at `src/app/`. Reuse the portal's design template.
- `sitemap.xml` and `robots.txt` via Next.js convention files.
- Structured data: `Organization` JSON-LD in the root layout with name, logo URL, contact phone (`+13232978843`), `sameAs` social links.
- Canonical `https://creatixreach.io/` for the root.

---

## 12. File structure (target tree)

```
creatixreach-marketing/
├── public/
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo-wordmark-white.png
│   ├── logo-wordmark-white-2x.png
│   ├── logo-wordmark-black.png
│   ├── logo-wordmark-black-2x.png
│   ├── icon-circle-light.png
│   ├── icon-circle-light-2x.png
│   ├── apple-icon.png
│   ├── sounds/
│   │   ├── keyboard-loop.mp3
│   │   ├── synth-pad.mp3
│   │   ├── server-hum.mp3
│   │   ├── call-center-ambience.mp3
│   │   ├── city-night.mp3
│   │   ├── click.mp3
│   │   ├── lead-captured.mp3
│   │   └── data-blip.mp3
│   └── lite-mode/
│       ├── scene-1.svg  (or .webp)
│       ├── scene-2.svg
│       ├── scene-3.svg
│       └── scene-4.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx            (root layout, fonts, metadata, JSON-LD)
│   │   ├── page.tsx              (the 5-scene experience)
│   │   ├── globals.css           (Tailwind + brand vars)
│   │   ├── icon.svg              (same as public/, Next.js auto-detects)
│   │   ├── apple-icon.png
│   │   ├── opengraph-image.png
│   │   ├── twitter-image.png
│   │   ├── sitemap.ts            (or sitemap.xml)
│   │   ├── robots.ts
│   │   ├── contact/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts
│   │   └── classic/
│   │       └── page.tsx          (Phase 2 — see Section 15)
│   ├── components/
│   │   ├── branding/
│   │   │   └── logo.tsx
│   │   ├── nav/
│   │   │   ├── scene-progress.tsx
│   │   │   ├── arrow-hints.tsx
│   │   │   └── top-menu.tsx
│   │   ├── ui/
│   │   │   ├── glass-panel.tsx
│   │   │   ├── cta-button.tsx
│   │   │   ├── whatsapp-button.tsx
│   │   │   ├── focus-ring.tsx
│   │   │   └── audio-gate.tsx
│   │   ├── scenes/
│   │   │   ├── scene-shell.tsx          (shared wrapper: 3D canvas + UI panel)
│   │   │   ├── scene-controller.tsx     (keyboard / scroll / swipe / index state)
│   │   │   ├── scene-0-hero.tsx
│   │   │   ├── scene-1-web-social.tsx
│   │   │   ├── scene-2-systems.tsx
│   │   │   ├── scene-3-dialer.tsx
│   │   │   ├── scene-4-cold-calling.tsx
│   │   │   ├── scene-5-final.tsx
│   │   │   └── three/
│   │   │       ├── code-rain.tsx
│   │   │       ├── floating-monitor.tsx
│   │   │       ├── server-rack.tsx
│   │   │       ├── headset-row.tsx
│   │   │       ├── city-skyline.tsx
│   │   │       └── particle-network.tsx
│   │   └── contact/
│   │       └── contact-form.tsx
│   ├── lib/
│   │   ├── cta-messages.ts       (WhatsApp prefill strings)
│   │   ├── audio.ts              (Howler wrapper, mute state)
│   │   ├── device-tier.ts        (Lite mode detection)
│   │   ├── resend.ts             (Resend client)
│   │   └── escape-html.ts
│   └── styles/
│       └── (Tailwind config + theme vars)
├── tailwind.config.ts
├── next.config.js
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── .env.local                    (gitignored)
```

---

## 13. Build phases (Claude Code delivers in this order)

Phase by phase. **Do not skip ahead.** Each phase ends with a deployable state.

### Phase 1 — Skeleton + brand + DNS-ready

1. `pnpm create next-app@latest creatixreach-marketing --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"`
2. Install dependencies from Section 3
3. Set up Tailwind theme with brand colors + Geist fonts via `next/font/local` (mirror the portal's `src/app/fonts/` setup)
4. Drop in brand assets to `public/` (Section 1)
5. Build root `layout.tsx` with metadata + JSON-LD + favicon detection
6. Build `Logo` component (mirror portal's `src/components/branding/logo.tsx`)
7. Build a placeholder `/` page that just shows the logo + tagline + "Coming soon" — so we can deploy and flip DNS in parallel with the rest of the build
8. Build `/contact` page + server action working end-to-end
9. First Vercel deploy + DNS flip (Section 14) — site is live with placeholder, contact form already collects leads

### Phase 2 — Scene 0 (hero) + nav system

1. Scene controller (keyboard / scroll / swipe / index state, exposed via context)
2. Audio gate modal + Howler wrapper + mute toggle
3. Scene 0 hero: code rain (Three.js shader or simple instanced sprites), 3 floating CRT monitors, parallax, copy panel, CTAs wired
4. Persistent UI: top logo, top-right "Send Brief", bottom arrow hints + scene dots, bottom-right floating WhatsApp
5. Glass-panel + CTA button components
6. Deploy. Test on owner's phone.

### Phase 3 — Scenes 1–4 (one at a time, deploy between each)

For each: 3D scene, copy panel, scene-specific audio loop, scene-specific WhatsApp prefill, scene-specific contact form `topic` query param. Deploy and screenshot to owner after each.

### Phase 4 — Scene 5 final + footer + polish

Recap cards, embedded contact form, footer, social links, structured data, sitemap, robots, OG images.

### Phase 5 — Lite mode + accessibility + SEO audit

Implement the auto-trigger from Section 9. Build the 4 Lite-mode SVG/PNG fallbacks. Run Lighthouse on mobile, fix anything below 90.

### Phase 6 — `/classic` page (optional but recommended)

A boring, professional, no-3D version of the same content at `/classic`. Link it from the footer as "Prefer the simple version? →". Some enterprise buyers will go straight there.

---

## 14. Owner-run setup steps

**🚨 The owner runs everything in this section personally. Claude Code only writes the code.**

### 14.A. Copy brand assets from portal to new project (in **PowerShell**)

```powershell
$portal = "C:\Users\CAVO TECH\Documents\creatixreach-portal\public"
$marketing = "C:\Users\CAVO TECH\Documents\creatixreach-marketing\public"

if (-not (Test-Path -LiteralPath $marketing)) {
  Write-Host "Marketing project public/ doesn't exist yet. Run pnpm create-next-app first." -ForegroundColor Red
  return
}
if ($LASTEXITCODE -ne 0) { return }

$files = @(
  "icon.svg", "icon-192.png", "icon-512.png",
  "logo-wordmark-white.png", "logo-wordmark-white-2x.png",
  "logo-wordmark-black.png", "logo-wordmark-black-2x.png",
  "icon-circle-light.png", "icon-circle-light-2x.png",
  "apple-icon.png"
)

foreach ($f in $files) {
  $src = Join-Path $portal $f
  if (Test-Path -LiteralPath $src) {
    Copy-Item -LiteralPath $src -Destination $marketing -Force
    Write-Host "✓ Copied $f" -ForegroundColor Green
  } else {
    Write-Host "⚠ Missing in portal: $f" -ForegroundColor Yellow
  }
}
```

### 14.B. Create the GitHub repo (in **GitHub web** + **PowerShell**)

1. In **GitHub web**: create new public repo `Creatixreach/creatixreach-marketing`. No README, no .gitignore (Next.js will create one). Click Create.
2. In **PowerShell** in the new project folder:

```powershell
cd "C:\Users\CAVO TECH\Documents\creatixreach-marketing"
git init
git branch -m main
git add -A
git commit -m "Initial commit - Next.js scaffold"
git remote add origin https://github.com/Creatixreach/creatixreach-marketing.git
git push -u origin main
```

### 14.C. Create the Vercel project (in **Vercel Dashboard**)

1. In **Vercel Dashboard**: **Add New → Project**. Pick the `creatixreach-marketing` repo. Framework auto-detects as Next.js.
2. Project name: `creatixreach-marketing`.
3. Region: `fra1` (Frankfurt — match portal).
4. Environment variables — add two:
   - `RESEND_API_KEY` = (copy from portal's env vars in **Vercel Dashboard** → `creatixreach-portal` → Settings → Environment Variables)
   - `ADMIN_NOTIFICATION_EMAIL` = `elhadad.design@gmail.com`
5. **Deploy**. Wait for green.
6. After deploy: **Settings → Domains** → add two domains:
   - `creatixreach.io` (apex)
   - `www.creatixreach.io`
7. Vercel will show "Invalid Configuration" with the exact DNS records to add. Don't add them blindly — see 14.D.

### 14.D. Flip the apex DNS from Hostinger AI to Vercel (in **Cloudflare Dashboard**)

> ⛔ **DO NOT TOUCH any DNS record where the Name field is `app`, `dialer`, anything ending in `.dialer1`, or any Resend / Cloudflare email auth records (`_dmarc`, `_domainkey`, `mx`, `resend._domainkey`).** Those belong to the portal and to email delivery. Touch only the **apex (`@`)** and **`www`** records.

1. In **Cloudflare Dashboard** → `creatixreach.io` → **DNS** → **Records**.
2. **Screenshot the current state of the DNS tab.** Save it somewhere. (Insurance against mistakes.)
3. Find the existing records pointing at Hostinger:
   - Likely an `A` record with Name `@` → some Hostinger IP
   - Likely a `CNAME` or `A` for `www` → Hostinger
   - Maybe a CAA record — leave alone
4. **Delete only those Hostinger-pointing apex + www records.** Confirm each one. Nothing else.
5. **Add the new records** (use the exact values Vercel showed you in 14.C step 7 — these are usually):
   - Type `A`, Name `@`, IPv4 `76.76.21.21`, Proxy status: **DNS only (grey cloud)** for the first 24h to make verification easier, switch to **Proxied (orange cloud)** later if you want Cloudflare CDN on top
   - Type `CNAME`, Name `www`, Target `cname.vercel-dns.com`, Proxy status: same as above
6. Back in **Vercel Dashboard** → project → Settings → Domains, wait 1–5 min for green checkmarks. Vercel will auto-issue SSL.
7. In a fresh browser tab, visit `https://creatixreach.io` — should show your Phase 1 placeholder.
8. **Sanity check** — visit `https://app.creatixreach.io/dashboard` — must still work. If it doesn't, you touched the wrong record. Revert from your screenshot.

### 14.E. After every deploy

```powershell
# In PowerShell, in the project folder
git add -A
git commit -m "feat: ..."
if ($LASTEXITCODE -ne 0) { return }
git push
```

Vercel auto-deploys on push to `main`.

---

## 15. Honest tradeoffs and risks

| Risk | Mitigation |
|---|---|
| 3D site is too slow on mid-range mobile (US/EU still has lots of it) or breaks on locked-down corporate desktops (no WebGL flags) | Lite mode auto-trigger (Section 9). Test on a 2-3 year old Android and on a corporate Windows machine with hardware acceleration disabled before launch. |
| Site is impressive but doesn't convert (some buyers want boring credibility, not a game) | `/classic` page in Phase 6. Floating WhatsApp + Send Brief always visible. Trust signals (years in business, customer logos if any) in Scene 5. |
| Audio annoys someone in a quiet office | OFF by default. Audio gate is opt-in. Mute toggle persistent. Honor `prefers-reduced-motion`. |
| DNS flip breaks `app.creatixreach.io` | Section 14.D's record-by-record rules + screenshot insurance + post-flip sanity check. |
| Contact form leads silently disappear (the portal had this exact bug — gotcha #167) | Same multi-recipient pattern + explicit `result.error` check + Vercel runtime logging. Verified by sending one test from `/contact` after deploy. |
| Resend domain not verified for the marketing project | The domain is verified at the apex level. Confirm in Resend dashboard before launch. If it asks for new DKIM records, those records are already in Cloudflare for the portal — they cover the apex too. |
| Search engines can't crawl the 3D site | All copy server-rendered as real HTML (Section 11). `/classic` page reinforces this. Sitemap submitted to Google Search Console after launch. |
| Heavy chunked JS pushes the FCP past Meta's "low quality landing page" threshold | Lazy-load Three.js scenes. Phase 1 placeholder ships before scenes are built — gives us a low-FCP baseline to compare against. |
| Owner wants to edit copy later but doesn't read code | All copy lives in `src/lib/scene-copy.ts` as a typed object. Single source of truth. Owner can find + edit text without touching components. |
| Owner is non-developer, will pull and break things | Same workflow as the portal: small PRs, deploy between phases, screenshot to owner for sign-off before merging the next phase. |

---

## 16. Testing checklist (run before going public)

- [ ] Hero loads on desktop Chrome — audio gate appears, click unlocks sound, scenes navigate by arrow keys
- [ ] Same on Firefox + Safari
- [ ] On iPhone Safari: swipe left/right cycles scenes; audio gate works; floating WhatsApp opens WhatsApp app correctly
- [ ] On a mid-range Android (test on owner's spare phone or BrowserStack): Lite mode triggers, no jank
- [ ] All 5 WhatsApp buttons open `wa.me/13232978843` with the right prefilled text
- [ ] Contact form submits successfully from `/contact` and from the embedded form in Scene 5
- [ ] Email arrives at **both** `info@creatixreach.io` **and** `elhadad.design@gmail.com` with `replyTo` set to the customer's email
- [ ] Vercel runtime logs show `[marketing-contact] sending to ...` + `[marketing-contact] sent, id=...`
- [ ] `/sitemap.xml` returns valid XML listing `/`, `/contact`, `/classic`
- [ ] `/robots.txt` allows everything
- [ ] OG image renders correctly when pasting `https://creatixreach.io` into Slack / WhatsApp / Twitter draft
- [ ] `https://app.creatixreach.io` still works (sign in, dashboard, etc.) — DNS flip didn't break it
- [ ] `https://www.creatixreach.io` redirects (or serves) — pick one and stick with it (Vercel's default is to serve, that's fine)
- [ ] Lighthouse mobile score: Performance ≥ 75, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 95
- [ ] Honeypot test: submit form with `_honey` filled — should silently succeed, no email sent
- [ ] `prefers-reduced-motion: reduce` in DevTools — site collapses to classic scroll layout, still navigable

---

## 17. Gotchas inherited from the portal project (apply to this build too)

- **Em-dash corruption in heredoc anchors** — when piping multi-line strings through PowerShell, em-dashes (—) can mojibake to `â€"`. Use ASCII hyphens in `str_replace` anchors, em-dashes only inside string literals that PowerShell never edits.
- **UTF-8 no-BOM writes** when writing files programmatically — use `[System.Text.UTF8Encoding]::new($false)` in PowerShell. Next.js / `pnpm` defaults are fine; this matters only for custom scripts.
- **Vercel rejects builds with TS unused-vars** — `@typescript-eslint/no-unused-vars` is an error. Don't ship dead imports.
- **`$LASTEXITCODE` guards** between PowerShell chained build steps. Patterns above already include them.
- **Vercel env var changes need redeploy** — adding `RESEND_API_KEY` after deploy doesn't apply to running instances. Redeploy from the dashboard or push a commit.
- **Resend may return 200 with an error in the body** — always check `result.error` explicitly.
- **Browser caches favicons aggressively** — hard refresh after deploying new icon assets.
- **Always specify the target window** when giving the owner a command. Owner has historically pasted SQL into PowerShell and PowerShell into Supabase SQL Editor. Every command block in any future support response should be preceded by an explicit interface label.

---

## 18. Out of scope (do NOT build in this project)

These belong to the portal at `app.creatixreach.io`, not here:

- Login / signup / Clerk auth
- Pricing tables (they live on the portal landing — let the portal market the dialer pricing; the marketing site links to the portal for that)
- Per-customer dashboards
- Payment flows
- Database, ORM, Prisma
- Email templates for transactional flows
- Ticketing
- KYC

The marketing site is a brochure with cinematic ambition. That's it.

---

## 19. After launch — what to track

Once Phase 6 is live, the owner should monitor:

- Vercel Analytics: which scenes get the most time-on-page, where bounces happen
- Contact form fill rate vs scene exits
- WhatsApp click count (Vercel Analytics tracks outbound clicks if you wrap the link in a `<a data-event="whatsapp-click">` and add a tiny `useEffect` reporter — or just count via Vercel)
- Source split: which scenes convert better for US vs EU traffic (Vercel Analytics geo-segments out of the box)
- Compare against the old Hostinger site's bounce rate as your baseline — if the cinematic version bounces *more* on cold traffic, that's a signal to make `/classic` the default landing for paid campaigns and keep the cinematic version for warm/referral traffic.

If after 30 days the marketing site has higher bounce than the old Hostinger site, that's a signal the cinematic version is too heavy and `/classic` should become the default for ads. Re-evaluate then.

---

**End of spec.** Hand this file to Claude Code. Read it, ask any questions, then build Phase 1.
