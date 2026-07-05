import React from "react";
import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "placement-action";
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
  const combinedClassName = `btn-${variant} ${className}`.trim();

  // Jika href berupa internal anchor link (smooth scroll)
  if (href) {
    if (href.startsWith("#")) {
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
