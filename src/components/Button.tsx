import React from "react";
import Link from "next/link";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "placement-action"
  | "cta-primary"
  | "cta-secondary"
  | "nav-btn"
  | "nav-btn-outline"
  | "form-btn";

interface ButtonProps {
  variant?: ButtonVariant;
  href?: string;
  icon?: string; // Class nama Flaticon e.g. "fi-rr-play"
  className?: string;
  onClick?: (e: React.MouseEvent<any>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

const classMap: Record<ButtonVariant, string> = {
  "primary": "btn-primary",
  "secondary": "btn-secondary",
  "placement-action": "btn-portal-outline btn-placement-action",
  "cta-primary": "cta-btn-primary",
  "cta-secondary": "cta-btn-secondary",
  "nav-btn": "nav-btn nav-btn-desktop",
  "nav-btn-outline": "nav-btn-outline nav-btn-desktop",
  "form-btn": "form-btn"
};

export default function Button({
  variant = "primary",
  href,
  icon,
  className = "",
  onClick,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const baseClassName = classMap[variant] || "btn-primary";
  const combinedClassName = `${baseClassName} ${className}`.trim();

  // Jika href berupa internal anchor link (smooth scroll)
  if (href) {
    if (href.startsWith("#") || href.startsWith("/#")) {
      return (
        <a
          href={href}
          className={combinedClassName}
          onClick={onClick}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {icon && <i className={`fi ${icon}`}></i>}
          {children}
        </a>
      );
    }

    // Jika href berupa navigasi halaman Next.js
    return (
      <Link
        href={href}
        className={combinedClassName}
        onClick={onClick}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {icon && <i className={`fi ${icon}`}></i>}
        {children}
      </Link>
    );
  }

  // Merender button HTML standar
  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon && <i className={`fi ${icon}`}></i>}
      {children}
    </button>
  );
}
