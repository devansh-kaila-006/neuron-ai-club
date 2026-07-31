import React from 'react';

interface BadgeProps {
  className?: string;
  size?: number | string;
}

export const GoldStampBadge: React.FC<BadgeProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] ${className}`}
  >
    <defs>
      <radialGradient id="goldGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFF7ED" />
        <stop offset="30%" stopColor="#FCD34D" />
        <stop offset="70%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#92400E" />
      </radialGradient>
      <linearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id="goldStar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    {/* Outer Ribbon / Seal edges */}
    <circle cx="50" cy="50" r="46" fill="url(#goldBorder)" />
    <circle cx="50" cy="50" r="42" fill="#78350F" />
    <circle cx="50" cy="50" r="40" fill="url(#goldGrad)" />
    {/* Inner decorative ring */}
    <circle cx="50" cy="50" r="34" stroke="#FFF7ED" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
    {/* Center Star Emblem */}
    <path
      d="M50 22L57.5 37.2L74.3 39.6L62.1 51.5L65 68.3L50 60.4L35 68.3L37.9 51.5L25.7 39.6L42.5 37.2L50 22Z"
      fill="url(#goldStar)"
      stroke="#B45309"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="50" r="6" fill="#FFF7ED" opacity="0.9" />
  </svg>
);

export const SilverStampBadge: React.FC<BadgeProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-[0_4px_12px_rgba(226,232,240,0.3)] ${className}`}
  >
    <defs>
      <radialGradient id="silverGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="35%" stopColor="#E2E8F0" />
        <stop offset="75%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>
      <linearGradient id="silverBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#silverBorder)" />
    <circle cx="50" cy="50" r="42" fill="#1E293B" />
    <circle cx="50" cy="50" r="40" fill="url(#silverGrad)" />
    <circle cx="50" cy="50" r="34" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
    <path
      d="M50 22L57.5 37.2L74.3 39.6L62.1 51.5L65 68.3L50 60.4L35 68.3L37.9 51.5L25.7 39.6L42.5 37.2L50 22Z"
      fill="#FFFFFF"
      stroke="#475569"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="50" r="6" fill="#F8FAFC" opacity="0.9" />
  </svg>
);

export const BronzeStampBadge: React.FC<BadgeProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-[0_4px_12px_rgba(217,119,6,0.3)] ${className}`}
  >
    <defs>
      <radialGradient id="bronzeGrad" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#FFEDD5" />
        <stop offset="35%" stopColor="#FDBA74" />
        <stop offset="75%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#451A03" />
      </radialGradient>
      <linearGradient id="bronzeBorder" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FED7AA" />
        <stop offset="50%" stopColor="#B45309" />
        <stop offset="100%" stopColor="#451A03" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#bronzeBorder)" />
    <circle cx="50" cy="50" r="42" fill="#451A03" />
    <circle cx="50" cy="50" r="40" fill="url(#bronzeGrad)" />
    <circle cx="50" cy="50" r="34" stroke="#FFEDD5" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
    <path
      d="M50 22L57.5 37.2L74.3 39.6L62.1 51.5L65 68.3L50 60.4L35 68.3L37.9 51.5L25.7 39.6L42.5 37.2L50 22Z"
      fill="#FFEDD5"
      stroke="#78350F"
      strokeWidth="1.5"
    />
    <circle cx="50" cy="50" r="6" fill="#FFF7ED" opacity="0.9" />
  </svg>
);
