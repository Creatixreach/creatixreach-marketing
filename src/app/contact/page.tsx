import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Mail, MessageSquare, Phone, Zap } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ContactForm } from "@/components/contact/contact-form";
import type { CtaTopic } from "@/lib/cta-messages";

export const metadata: Metadata = {
  title: "Send a brief",
  description:
    "Tell CreatixReach what you need - websites, custom systems, call center setup, or a cold-calling campaign. We reply within one business day.",
};

const VALID_TOPICS: CtaTopic[] = [
  "general",
  "web-social",
  "systems",
  "dialer",
  "cold-calling",
];

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { topic?: string };
}) {
  const raw = searchParams?.topic;
  const initialTopic: CtaTopic =
    raw && (VALID_TOPICS as string[]).includes(raw)
      ? (raw as CtaTopic)
      : "general";

  return (
    <div className="min-h-screen bg-brand-navy text-brand-text-dark">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-brand-navy/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-brand-muted-dark transition-colors hover:text-brand-text-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </header>

      <main className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                  Send us a brief.
                </h1>
                <p className="mt-4 text-balance text-lg text-brand-muted-dark">
                  Tell us what you need. We reply within one business day from
                  a real human.
                </p>

                <div className="mt-10 space-y-6">
                  <Benefit
                    icon={Zap}
                    title="Fast answers"
                    description="Real humans, no AI deflection. Most replies same-day."
                  />
                  <Benefit
                    icon={MessageSquare}
                    title="No pressure"
                    description="Ask anything. No commitment, no drip campaigns."
                  />
                  <Benefit
                    icon={Phone}
                    title="Live demo"
                    description="Want to see something in action? We will book a screen-share at your pace."
                  />
                </div>

                <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-brand-indigo" />
                    Prefer email?
                  </div>
                  <Link
                    href="mailto:info@creatixreach.io"
                    className="mt-2 inline-block text-sm text-brand-indigo hover:underline"
                  >
                    info@creatixreach.io
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
                  <ContactForm initialTopic={initialTopic} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Benefit({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-indigo/15 text-brand-indigo">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <p className="mt-1 text-sm leading-relaxed text-brand-muted-dark">
          {description}
        </p>
      </div>
    </div>
  );
}
