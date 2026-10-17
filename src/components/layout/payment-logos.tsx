"use client";

import React from "react";

export function QrisLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/qris-logo-white.png"
        alt="QRIS"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/qris-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BcaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bca-logo-white.png"
        alt="Bank BCA"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bca-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MandiriLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/mandiri-logo-white.png"
        alt="Bank Mandiri"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/mandiri-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BniLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bni-logo-white.png"
        alt="Bank BNI"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bni-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BriLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bri-logo-white.png?v=2"
        alt="Bank BRI"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bri-logo.png?v=2"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function GopayLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/gopay-logo-white.png"
        alt="GoPay"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/gopay-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function OvoLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/ovo-logo-white.png"
        alt="OVO"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/ovo-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function DanaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/dana-logo-white.png"
        alt="DANA"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/dana-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function VisaLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/visa-logo-white.png"
        alt="Visa"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/visa-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MastercardLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/mastercard-logo-white.png"
        alt="Mastercard"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/mastercard-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MidtransLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/midtrans-logo-white.png"
        alt="Midtrans"
        decoding="async"
        className="h-full w-auto object-contain transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/midtrans-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
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
