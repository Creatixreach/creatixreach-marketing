import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Logo } from "@/components/branding/logo";

const WHATSAPP_URL =
  "https://wa.me/13232978843?text=" +
  encodeURIComponent("Hi CreatixReach, I saw your site and want to talk.");

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-brand-navy text-brand-text-dark">
      <header className="w-full px-6 pt-8 sm:px-10">
        <Logo size="md" />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-widest text-brand-muted-dark">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-indigo" />
          Site relaunch in progress
        </div>

        <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
          We run the whole stack.
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-brand-muted-dark sm:text-xl">
          Digital solutions, built end-to-end. Websites. Systems. Call centers.
          Leads. A new cinematic experience is on the way - in the meantime,
          tell us what you need and we will get back within one business day.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-indigo px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-indigo/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
          >
            Send Brief
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-[#25D366]/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#25D366]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp Now
          </a>
        </div>
      </section>

      <footer className="w-full px-6 pb-8 text-center text-xs text-brand-muted-dark sm:px-10">
        &copy; {new Date().getFullYear()} CreatixReach. We run the whole stack.
      </footer>
    </main>
  );
}
