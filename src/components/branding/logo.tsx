import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<
  LogoSize,
  { icon: number; wordHeight: number; gap: string }
> = {
  sm: { icon: 28, wordHeight: 18, gap: "gap-2" },
  md: { icon: 36, wordHeight: 24, gap: "gap-2.5" },
  lg: { icon: 56, wordHeight: 36, gap: "gap-3" },
};

// Intrinsic dims of the 2x wordmark PNG (1200 wide, aspect ~7.59:1)
const WORDMARK_W = 1200;
const WORDMARK_H = 158;

export function Logo({
  size = "md",
  className,
  showWordmark = true,
}: {
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
}) {
  const cfg = SIZES[size];

  return (
    <div className={cn("flex items-center", cfg.gap, className)}>
      <Image
        src="/icon.svg"
        alt=""
        width={cfg.icon}
        height={cfg.icon}
        priority
        className="rounded-md"
      />
      {showWordmark && (
        <>
          {/* Light mode: black wordmark */}
          <Image
            src="/logo-wordmark-black-2x.png"
            alt="CreatixReach"
            width={WORDMARK_W}
            height={WORDMARK_H}
            priority
            style={{ height: cfg.wordHeight, width: "auto" }}
            className="dark:hidden"
          />
          {/* Dark mode: white wordmark */}
          <Image
            src="/logo-wordmark-white-2x.png"
            alt="CreatixReach"
            width={WORDMARK_W}
            height={WORDMARK_H}
            priority
            style={{ height: cfg.wordHeight, width: "auto" }}
            className="hidden dark:block"
          />
        </>
      )}
    </div>
  );
}
