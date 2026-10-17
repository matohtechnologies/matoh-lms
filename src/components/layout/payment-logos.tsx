"use client";

import React from "react";

export function QrisLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome QRIS Logo (Idle) */}
      <img
        src="/images/qris-logo-white.png"
        alt="QRIS"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored QRIS Logo (Hover) */}
      <img
        src="/images/qris-logo.png"
        alt="QRIS"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function BcaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome BCA Logo (Idle) */}
      <img
        src="/images/bca-logo-white.png"
        alt="Bank BCA"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Blue BCA Logo (Hover) */}
      <img
        src="/images/bca-logo.png"
        alt="Bank BCA"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function MandiriLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome Mandiri Logo (Idle) */}
      <img
        src="/images/mandiri-logo-white.png"
        alt="Bank Mandiri"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored Mandiri Logo (Hover) */}
      <img
        src="/images/mandiri-logo.png"
        alt="Bank Mandiri"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function BniLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome BNI Logo (Idle) */}
      <img
        src="/images/bni-logo-white.png"
        alt="Bank BNI"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored BNI Logo (Hover) */}
      <img
        src="/images/bni-logo.png"
        alt="Bank BNI"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function BriLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome BRI Logo (Idle) */}
      <img
        src="/images/bri-logo-white.png?v=2"
        alt="Bank BRI"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored BRI Logo (Hover) */}
      <img
        src="/images/bri-logo.png?v=2"
        alt="Bank BRI"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function GopayLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome GoPay Logo (Idle) */}
      <img
        src="/images/gopay-logo-white.png"
        alt="GoPay"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored GoPay Logo (Hover) */}
      <img
        src="/images/gopay-logo.png"
        alt="GoPay"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function OvoLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome OVO Logo (Idle) */}
      <img
        src="/images/ovo-logo-white.png"
        alt="OVO"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored OVO Logo (Hover) */}
      <img
        src="/images/ovo-logo.png"
        alt="OVO"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function DanaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome DANA Logo (Idle) */}
      <img
        src="/images/dana-logo-white.png"
        alt="DANA"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored DANA Logo (Hover) */}
      <img
        src="/images/dana-logo.png"
        alt="DANA"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function VisaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome Visa Logo (Idle) */}
      <img
        src="/images/visa-logo-white.png"
        alt="Visa"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored Visa Logo (Hover) */}
      <img
        src="/images/visa-logo.png"
        alt="Visa"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function MastercardLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome Mastercard Logo (Idle) */}
      <img
        src="/images/mastercard-logo-white.png"
        alt="Mastercard"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored Mastercard Logo (Hover) */}
      <img
        src="/images/mastercard-logo.png"
        alt="Mastercard"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}

export function MidtransLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* White Monochrome Midtrans Logo (Idle) */}
      <img
        src="/images/midtrans-logo-white.png"
        alt="Midtrans"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain block group-hover:hidden transition-all duration-300"
      />
      {/* Official Colored Midtrans Logo (Hover) */}
      <img
        src="/images/midtrans-logo.png"
        alt="Midtrans"
        loading="lazy"
        decoding="async"
        className="h-full w-auto object-contain hidden group-hover:block transition-all duration-300"
      />
    </span>
  );
}


export const PAYMENT_METHODS = [
  { name: "QRIS", component: QrisLogo },
  { name: "BCA", component: BcaLogo },
  { name: "Mandiri", component: MandiriLogo },
  { name: "BNI", component: BniLogo },
  { name: "BRI", component: BriLogo },
  { name: "GoPay", component: GopayLogo },
  { name: "OVO", component: OvoLogo },
  { name: "DANA", component: DanaLogo },
  { name: "Visa", component: VisaLogo },
  { name: "Mastercard", component: MastercardLogo },
  { name: "Midtrans", component: MidtransLogo },
];
