"use client";

import type { ReactNode } from "react";

type TipProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/** Fast CSS tooltip — no external libs. */
export function Tip({ label, children, className = "" }: TipProps) {
  return (
    <span className={`tip ${className}`.trim()} data-tip={label}>
      {children}
    </span>
  );
}
