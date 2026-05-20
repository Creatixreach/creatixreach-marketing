"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContactAction } from "@/app/contact/actions";
import { TOPIC_LABELS, type CtaTopic } from "@/lib/cta-messages";

const TOPIC_ORDER: CtaTopic[] = [
  "general",
  "web-social",
  "systems",
  "dialer",
  "cold-calling",
];

const BUDGET_OPTIONS = [
  { value: "", label: "Pick one (optional)" },
  { value: "<$1k", label: "Less than $1k" },
  { value: "$1-5k", label: "$1k - $5k" },
  { value: "$5-20k", label: "$5k - $20k" },
  { value: "$20k+", label: "$20k+" },
  { value: "Not sure yet", label: "Not sure yet" },
];

export function ContactForm({
  initialTopic = "general",
}: {
  initialTopic?: CtaTopic;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitContactAction(formData);
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-12 text-center text-brand-text-dark">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-indigo/15 text-brand-indigo">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="text-xl font-semibold">Message sent</div>
        <p className="max-w-md text-sm leading-relaxed text-brand-muted-dark">
          Thanks for reaching out. Our team will get back to you within one
          business day at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-brand-text-dark">
      {/* Honeypot - hidden from real users, bots fill it */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          required
          placeholder="Jane Doe"
          disabled={pending}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          disabled={pending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company"
          name="company"
          placeholder="Acme Inc."
          disabled={pending}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+1 555 123 4567"
          disabled={pending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="What is this about?"
          name="topic"
          required
          defaultValue={initialTopic}
          disabled={pending}
          options={TOPIC_ORDER.map((t) => ({
            value: t,
            label: TOPIC_LABELS[t],
          }))}
        />
        <SelectField
          label="Budget"
          name="budget"
          disabled={pending}
          options={BUDGET_OPTIONS}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          How can we help? <span className="text-red-400">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us about your project, current setup, and what you are trying to solve."
          disabled={pending}
          className="flex w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-brand-text-dark placeholder:text-brand-muted-dark/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-brand-muted-dark">
          We typically reply within one business day.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-indigo px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-indigo/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-brand-text-dark placeholder:text-brand-muted-dark/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required = false,
  disabled,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        className="flex h-10 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-brand-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-brand-navy">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
