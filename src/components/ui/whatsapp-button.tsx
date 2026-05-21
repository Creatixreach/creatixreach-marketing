import { cn } from "@/lib/utils";
import { WhatsappIcon } from "@/components/ui/whatsapp-icon";

export function WhatsappButton({
  href,
  label = "Chat on WhatsApp",
  className,
}: {
  href: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl ring-1 ring-black/10 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/60 motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-[ping_2.4s_ease-in-out_infinite]"
      />
      <WhatsappIcon className="relative h-7 w-7" />
    </a>
  );
}
