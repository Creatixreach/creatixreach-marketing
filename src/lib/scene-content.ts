// Central source of truth for per-scene marketing copy.
//
// Owner: edit strings here before deploy. Components import from this file —
// they should not hardcode any user-facing strings.
//
// NOTE: any "achievement" or "stat" numbers below are examples. Replace with
// real figures before going live.

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Home,
  LogIn,
  Megaphone,
  Rocket,
  ScrollText,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
  Users,
  Zap,
} from "lucide-react";

// -------- Shared types --------

export type SimpleIconCard = {
  /** simpleicons.org slug (e.g. "nextdotjs", "shopify"). Renders as
   *  https://cdn.simpleicons.org/<slug>/94a3b8 */
  slug: string;
  name: string;
  blurb: string;
};

export type LucideCard = {
  Icon: LucideIcon;
  name: string;
  blurb: string;
};

export type ContentStrip<T> = {
  label: string;
  cards: T[];
};

export type PortalPill = {
  Icon: LucideIcon;
  label: string;
  tooltip: string;
  /** Always opens app.creatixreach.io for now. */
  href: string;
};

export type Stat = {
  display: string;
  caption: string;
};

// -------- Scene 1: Web Creation and Social Media --------

export const SCENE_1_STACKS: ContentStrip<SimpleIconCard> = {
  label: "Stacks we ship on",
  cards: [
    {
      slug: "nextdotjs",
      name: "Next.js",
      blurb: "Production React for fast, SEO-friendly sites",
    },
    {
      slug: "shopify",
      name: "Shopify",
      blurb: "Hosted e-commerce when you need scale, not custom checkout",
    },
    {
      slug: "webflow",
      name: "Webflow",
      blurb: "Visual CMS for marketing teams who want to ship without devs",
    },
    {
      slug: "meta",
      name: "Meta Business Suite",
      blurb: "Paid social on Instagram and Facebook done right",
    },
    {
      slug: "tiktok",
      name: "TikTok Ads Manager",
      blurb: "Where your next customers actually scroll",
    },
    {
      slug: "hubspot",
      name: "HubSpot",
      blurb: "CRM glued to your marketing so nothing falls through",
    },
  ],
};

export const SCENE_1_SITES: ContentStrip<LucideCard> = {
  label: "Sites we know how to build",
  cards: [
    {
      Icon: CalendarCheck,
      name: "Booking and reservation platforms",
      blurb: "Calendly-style flows, hotel, clinic, and salon booking",
    },
    {
      Icon: Home,
      name: "Real estate listing sites",
      blurb: "Searchable listings, agent dashboards, lead capture",
    },
    {
      Icon: ShoppingBag,
      name: "E-commerce stores",
      blurb: "Shopify and custom Next + Stripe builds",
    },
    {
      Icon: Rocket,
      name: "SaaS landing pages",
      blurb: "Conversion-focused funnels with embedded auth and pricing",
    },
    {
      Icon: Briefcase,
      name: "Corporate and agency sites",
      blurb: "Multi-page brand experiences with CMS",
    },
    {
      Icon: GraduationCap,
      name: "Education and course platforms",
      blurb: "LMS, video lessons, certificate flows",
    },
  ],
};

// -------- Scene 2: Systems, APIs, Automations, Integrations --------

export const SCENE_2_PLATFORMS: ContentStrip<SimpleIconCard> = {
  label: "Platforms we integrate, automate, and build on",
  cards: [
    {
      slug: "make",
      name: "Make",
      blurb:
        "Visual automation for ops teams who want to stop doing things by hand",
    },
    {
      slug: "twilio",
      name: "Twilio",
      blurb: "Programmable SMS, voice, and messaging at scale",
    },
    {
      slug: "stripe",
      name: "Stripe",
      blurb: "Payments, billing, subscriptions wired in cleanly",
    },
    {
      slug: "supabase",
      name: "Supabase",
      blurb: "Postgres, auth, and storage for custom backends",
    },
  ],
};

export const SCENE_2_VERTICALS: ContentStrip<LucideCard> = {
  label: "Vertical products we ship",
  cards: [
    {
      Icon: Home,
      name: "Real estate platforms",
      blurb: "Listing CRMs, agent apps, tenant portals, viewing scheduling",
    },
    {
      Icon: Stethoscope,
      name: "Healthcare systems",
      blurb: "Appointment booking, patient records, clinic management",
    },
    {
      Icon: Briefcase,
      name: "Career and HR apps",
      blurb: "Job boards, ATS pipelines, candidate review workflows",
    },
    {
      Icon: GraduationCap,
      name: "Education platforms",
      blurb: "Learning management, course delivery, progress tracking",
    },
    {
      Icon: Truck,
      name: "Logistics and delivery",
      blurb: "Driver apps, route optimization, customer tracking pages",
    },
    {
      Icon: Sparkles,
      name: "AI-powered tools",
      blurb: "Custom GPT integrations, smart automations, content generation",
    },
  ],
};

// -------- Scene 3: CreatixReach Dialer portal showcase --------

export const SCENE_3_PORTAL_INTRO = "What runs CreatixReach Dialer";
export const SCENE_3_PORTAL_HREF = "https://app.creatixreach.io";

export const SCENE_3_PORTAL_PILLS: PortalPill[] = [
  {
    Icon: Zap,
    label: "Easy Onboarding",
    tooltip: "Quick-start your call center in under 30 minutes",
    href: SCENE_3_PORTAL_HREF,
  },
  {
    Icon: Megaphone,
    label: "Create Campaigns",
    tooltip: "Build outbound campaigns with scripts and lead lists",
    href: SCENE_3_PORTAL_HREF,
  },
  {
    Icon: CreditCard,
    label: "Manage Payments",
    tooltip: "Track usage, top up balance, view invoices",
    href: SCENE_3_PORTAL_HREF,
  },
  {
    Icon: ScrollText,
    label: "Call Logs",
    tooltip: "Listen to recordings, audit agent activity",
    href: SCENE_3_PORTAL_HREF,
  },
  {
    Icon: Users,
    label: "Manage Agents",
    tooltip: "Add agents, assign roles, monitor live calls",
    href: SCENE_3_PORTAL_HREF,
  },
  {
    Icon: LogIn,
    label: "Sign in to Portal",
    tooltip: "Existing customers, go to your dashboard",
    href: SCENE_3_PORTAL_HREF,
  },
];

// -------- Scene 4: Cold calling pricing + stats --------

export const SCENE_4_PRICING = {
  amount: "$5",
  unit: "per hour, per cold caller",
  detail:
    "Pay-as-you-call. Native English and USA-experienced agents. No long-term contract.",
};

// These are example numbers. Owner edits in src/lib/scene-content.ts before deploy.
export const SCENE_4_STATS: Stat[] = [
  { display: "250,000+", caption: "USA calls connected this year" },
  { display: "48 states", caption: "Active dialing coverage" },
  { display: "under 30s", caption: "Average connect time" },
  { display: "7 leads", caption: "Per agent per day average" },
];
