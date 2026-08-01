"use client";

import { useId } from "react";

type BrandLogoProps = {
  size?: number;
  className?: string;
};

/** Original Balaban Note mark — note leaf + ink tip. */
export function BrandLogo({ size = 40, className = "" }: BrandLogoProps) {
  const uid = useId().replace(/:/g, "");
  const bg = `${uid}-bg`;
  const pen = `${uid}-pen`;
  const glow = `${uid}-glow`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo ${className}`.trim()}
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="8" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.45" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id={pen} x1="36" y1="10" x2="56" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${bg})`} filter={`url(#${glow})`} />

      <path
        d="M18 16.5h18.5L44 24v24.5a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3v-29a3 3 0 0 1 3-3Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M36.5 16.5V24H44" fill="#E0F2FE" />
      <path d="M36.5 16.5 44 24H39.5a3 3 0 0 1-3-3V16.5Z" fill="#BAE6FD" />

      <path
        d="M22 31h16M22 36.5h14M22 42h11"
        stroke="#0F766E"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />

      <path
        d="M40.5 28.5 52 17l4.2 4.2-11.5 11.5-5.2 1.5 1-5.2Z"
        fill={`url(#${pen})`}
        stroke="#fff"
        strokeWidth="1.2"
      />
      <circle cx="51.2" cy="18.8" r="1.6" fill="#fff" opacity="0.9" />
    </svg>
  );
}
