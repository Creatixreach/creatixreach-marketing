import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CtaVariant = "primary" | "whatsapp" | "ghost";
export type CtaSize = "md" | "lg";

const VARIANT_CLASSES: Record<CtaVariant, string> = {
  primary:
    "bg-brand-indigo text-white shadow-lg hover:bg-brand-indigo/90 focus-visible:ring-brand-indigo",
  whatsapp:
    "bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5b] focus-visible:ring-[#25D366]",
  ghost:
    "border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:ring-white",
};

const SIZE_CLASSES: Record<CtaSize, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy disabled:opacity-60 disabled:pointer-events-none";

type CommonProps = {
  variant?: CtaVariant;
  size?: CtaSize;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
    external?: undefined;
  };

export type CtaButtonProps = AnchorProps | ButtonProps;

export const CtaButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  CtaButtonProps
>(function CtaButton(props, ref) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "lg";
  const classes = cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], props.className);

  if ("href" in props && props.href) {
    const { href, external, children, variant: _v, size: _s, className: _c, ...rest } = props;
    void _v;
    void _s;
    void _c;
    if (external || href.startsWith("http") || href.startsWith("mailto:")) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { children, variant: _v, size: _s, className: _c, ...rest } = props as ButtonProps;
  void _v;
  void _s;
  void _c;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      type={rest.type ?? "button"}
      {...rest}
    >
      {children}
    </button>
  );
});
