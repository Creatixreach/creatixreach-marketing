// Single source of truth for WhatsApp prefill messages per scene/topic.
// Owner edits copy here.

export const WHATSAPP_NUMBER = "13232978843";

export type CtaTopic =
  | "general"
  | "web-social"
  | "systems"
  | "dialer"
  | "cold-calling";

export const CTA_MESSAGES: Record<CtaTopic, string> = {
  general: "Hi CreatixReach, I saw your site and want to talk.",
  "web-social":
    "Hi! I want to talk about a website / social media project.",
  systems: "Hi! I need help with a custom system / API / automation.",
  dialer:
    "Hi! I want to set up a call center / try the CreatixReach Dialer.",
  "cold-calling":
    "Hi! I'd like to talk about a cold-calling or lead-gen campaign.",
};

export const TOPIC_LABELS: Record<CtaTopic, string> = {
  general: "General",
  "web-social": "Web & Social",
  systems: "Systems & APIs",
  dialer: "Call Center / Dialer",
  "cold-calling": "Cold Calling / Leads",
};

export function whatsappUrl(topic: CtaTopic): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    CTA_MESSAGES[topic]
  )}`;
}
