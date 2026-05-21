import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/branding/logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "CreatixReach terms of service — coming soon.",
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.25em] text-brand-muted-dark">
            Coming soon
          </p>
          <p className="mt-8 text-base leading-relaxed text-brand-muted-dark">
            Full terms are in drafting. Until then: anything you discuss with
            CreatixReach is treated as confidential. Engagements are governed by
            project-specific written agreements between you and CreatixReach.
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
