import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/branding/logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CreatixReach privacy policy — coming soon.",
};

export default function PrivacyPage() {
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
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-brand-muted-dark">
            Coming soon
          </p>
          <p className="mt-8 text-base leading-relaxed text-brand-muted-dark">
            We&apos;re drafting the full privacy policy. In the meantime: CreatixReach
            only uses the contact information you submit through this site to
            reply to you. We never sell or share your data with third parties.
            For questions, email{" "}
            <a
              href="mailto:info@creatixreach.io"
              className="text-brand-indigo hover:underline"
            >
              info@creatixreach.io
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
