import React from 'react';

export const AmexLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 28 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="American Express">
    <rect width="28" height="20" rx="3" fill="#0077A6" />
    <text x="14" y="9" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">AM</text>
    <text x="14" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">EX</text>
  </svg>
);

export const VisaLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 42 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Visa">
    <path
      d="M16.5 15.2L18.9 4.8H22L19.6 15.2H16.5ZM29.8 5C29.1 4.7 28 4.5 26.6 4.5C23.3 4.5 21 6.1 20.9 8.2C20.8 9.9 22.5 10.7 23.8 11.3C25 11.9 25.5 12.3 25.5 12.9C25.5 13.8 24.4 14.2 23.3 14.2C21.7 14.2 20.7 13.9 19.7 13.5L19.2 13.2L18.7 15.8C19.5 16.2 21.2 16.5 22.9 16.5C26.4 16.5 28.7 15 28.8 12.6C28.9 10.8 27.4 9.9 25.8 9.2C24.7 8.7 24 8.4 24 7.8C24 7.2 24.8 6.8 25.6 6.8C26.6 6.8 27.4 7 28.1 7.3L28.4 7.5L29.8 5ZM38.4 4.8H36C35.2 4.8 34.6 5.1 34.2 5.9L29.2 15.2H32.5L33.2 13.4H37.1L37.5 15.2H40.4L38.4 4.8ZM34.2 11.1L35.8 6.9L36.7 11.1H34.2ZM12.7 4.8L9.7 12.2L9.4 10.5C8.8 8.6 7.1 6.7 5.2 5.6L7.9 15.2H11.2L16.2 4.8H12.7Z"
      fill="#1A55ED"
    />
    <path
      d="M7.1 4.8H1.9L1.8 5C5.7 6 9 8.6 10 11.6L9 6.2C8.8 5.1 8 4.8 7.1 4.8Z"
      fill="#F79E1B"
    />
  </svg>
);

export const MastercardLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 32 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mastercard">
    <circle cx="11" cy="10" r="7.5" fill="#EB001B" />
    <circle cx="21" cy="10" r="7.5" fill="#F79E1B" />
    <path
      d="M16 4.9C17.6 6.2 18.6 8 18.6 10C18.6 12 17.6 13.8 16 15.1C14.4 13.8 13.4 12 13.4 10C13.4 8 14.4 6.2 16 4.9Z"
      fill="#FF5F00"
    />
  </svg>
);

export const MaestroLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 32 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maestro">
    <circle cx="11" cy="10" r="7.5" fill="#EB001B" />
    <circle cx="21" cy="10" r="7.5" fill="#00A2E5" />
    <path
      d="M16 4.9C17.6 6.2 18.6 8 18.6 10C18.6 12 17.6 13.8 16 15.1C14.4 13.8 13.4 12 13.4 10C13.4 8 14.4 6.2 16 4.9Z"
      fill="#7B3F98"
    />
  </svg>
);

export const UnionPayLogo: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <svg viewBox="0 0 32 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="UnionPay">
    <g transform="skewX(-12) translate(1, 0)">
      <rect x="3" y="2.5" width="8" height="15" rx="1.5" fill="#E21836" />
      <rect x="10.5" y="2.5" width="8" height="15" rx="1.5" fill="#00457C" />
      <rect x="18" y="2.5" width="8" height="15" rx="1.5" fill="#007E3A" />
    </g>
    <text x="16" y="9.5" textAnchor="middle" fill="#FFFFFF" fontSize="4.2" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">Union</text>
    <text x="16" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="4.2" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">Pay</text>
  </svg>
);

export interface CardBrandRowProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const CardBrandRow: React.FC<CardBrandRowProps> = ({ className = "", size = "md" }) => {
  const heightClass = size === 'xs' ? 'h-3.5' : size === 'sm' ? 'h-4' : 'h-5';
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${className}`}>
      <AmexLogo className={`${heightClass} w-auto shrink-0`} />
      <VisaLogo className={`${heightClass} w-auto shrink-0`} />
      <MastercardLogo className={`${heightClass} w-auto shrink-0`} />
      <MaestroLogo className={`${heightClass} w-auto shrink-0`} />
      <UnionPayLogo className={`${heightClass} w-auto shrink-0`} />
    </div>
  );
};
