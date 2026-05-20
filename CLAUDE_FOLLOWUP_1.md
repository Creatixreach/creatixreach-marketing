# Phase 1 - Answers + Go

## Q1 follow-up: scaffolding into non-empty folder

Keep `CREATIXREACH_MARKETING_SITE_BUILD_SPEC.md` and `CLAUDE_FOLLOWUP_1.md` in the folder. Do not delete them, they will be referenced across all phases. If `pnpm create next-app` complains about non-empty dir, scaffold into a sibling temp folder (`..\creatixreach-marketing-tmp\`) then merge contents in, preserving both .md files at the project root.

## Q2: OG images for Phase 1

Generate simple branded placeholders. 1200x630 PNG, navy `#0f172a` background, circle icon + white wordmark + tagline "We run the whole stack." Same visual language as the portal OG so the brand reads consistently. Save to `src/app/opengraph-image.png` and `src/app/twitter-image.png`. Final art comes later. Placeholders unblock the deploy.

## Q3: Read portal patterns before writing equivalents

Yes. Read (do not write) these from `C:\Users\CAVO TECH\Documents\creatixreach-portal\` so the new code matches the portal patterns exactly:

- `src/app/contact/actions.ts` (server action shape, Resend call, error handling, log format)
- `src/app/contact/page.tsx` (form structure, client/server split)
- `src/components/branding/logo.tsx` (sizes, theme-aware wordmark swap)
- `src/app/layout.tsx` (root metadata, favicon, JSON-LD pattern)
- `src/app/globals.css` (Tailwind theme, brand CSS vars)
- `src/app/fonts/` directory: copy the Geist Sans + Geist Mono local font files into the new project. Do not redownload, version-match matters.
- `tailwind.config.ts`
- `next.config.js`
- `package.json` (align on exact versions of Next, React, Tailwind, eslint config)

Permission granted to READ that directory. Never write or modify anything in the portal repo under any circumstances.

## After Phase 1 completes, report back to the owner

1. Confirmation that `pnpm dev` runs locally with no errors
2. How the owner can test the `/contact` form end-to-end in the browser at `http://localhost:3000/contact`
3. List of commits staged locally and ready to push (do not push them)
4. Anything you could not do or had to deviate from

DO NOT push to GitHub. DO NOT trigger any Vercel deploy. The owner runs all GitHub, Vercel, and Cloudflare DNS steps personally per Section 14 of the spec.