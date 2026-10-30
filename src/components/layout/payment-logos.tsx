"use client";

import React from "react";

export function QrisLogo({ className = "h-[18px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/qris-logo-white.png"
        alt="QRIS"
        decoding="async"
        width={1024}
        height={388}
        style={{ aspectRatio: "1024 / 388" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/qris-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1024}
        height={388}
        style={{ aspectRatio: "1024 / 388" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BcaLogo({ className = "h-[16px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bca-logo-white.png"
        alt="Bank BCA"
        decoding="async"
        width={300}
        height={94}
        style={{ aspectRatio: "300 / 94" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bca-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1000}
        height={313}
        style={{ aspectRatio: "1000 / 313" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MandiriLogo({ className = "h-[21px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/mandiri-logo-white.png"
        alt="Bank Mandiri"
        decoding="async"
        width={300}
        height={88}
        style={{ aspectRatio: "300 / 88" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/mandiri-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={300}
        height={88}
        style={{ aspectRatio: "300 / 88" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BniLogo({ className = "h-[15px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bni-logo-white.png"
        alt="Bank BNI"
        decoding="async"
        width={200}
        height={58}
        style={{ aspectRatio: "200 / 58" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bni-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={200}
        height={58}
        style={{ aspectRatio: "200 / 58" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function BriLogo({ className = "h-[17px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/bri-logo-white.png"
        alt="Bank BRI"
        decoding="async"
        width={296}
        height={111}
        style={{ aspectRatio: "296 / 111" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/bri-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={296}
        height={111}
        style={{ aspectRatio: "296 / 111" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function GopayLogo({ className = "h-[17px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/gopay-logo-white.png"
        alt="GoPay"
        decoding="async"
        width={1024}
        height={225}
        style={{ aspectRatio: "1024 / 225" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/gopay-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1024}
        height={229}
        style={{ aspectRatio: "1024 / 229" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function OvoLogo({ className = "h-[16px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/ovo-logo-white.png"
        alt="OVO"
        decoding="async"
        width={1024}
        height={319}
        style={{ aspectRatio: "1024 / 319" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/ovo-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1024}
        height={319}
        style={{ aspectRatio: "1024 / 319" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function DanaLogo({ className = "h-[16px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/dana-logo-white.png"
        alt="DANA"
        decoding="async"
        width={300}
        height={86}
        style={{ aspectRatio: "300 / 86" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/dana-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={300}
        height={86}
        style={{ aspectRatio: "300 / 86" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function VisaLogo({ className = "h-[15px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/visa-logo-white.png"
        alt="Visa"
        decoding="async"
        width={1024}
        height={332}
        style={{ aspectRatio: "1024 / 332" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/visa-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1024}
        height={332}
        style={{ aspectRatio: "1024 / 332" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MastercardLogo({ className = "h-[20px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/mastercard-logo-white.png"
        alt="Mastercard"
        decoding="async"
        width={243}
        height={150}
        style={{ aspectRatio: "243 / 150" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/mastercard-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={243}
        height={150}
        style={{ aspectRatio: "243 / 150" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export function MidtransLogo({ className = "h-[18px] w-auto" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/images/midtrans-logo-white.png"
        alt="Midtrans"
        decoding="async"
        width={1024}
        height={168}
        style={{ aspectRatio: "1024 / 168" }}
        className="h-full w-auto object-contain opacity-80 transition-opacity duration-200 group-hover:opacity-0"
      />
      <img
        src="/images/midtrans-logo.png"
        alt=""
        aria-hidden="true"
        decoding="async"
        width={1024}
        height={168}
        style={{ aspectRatio: "1024 / 168" }}
        className="absolute inset-0 m-auto h-full w-auto object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
      />
    </span>
  );
}

export const PAYMENT_METHODS = [
  { name: "QRIS", component: QrisLogo, opticalHeight: "h-[18px]" },
  { name: "BCA", component: BcaLogo, opticalHeight: "h-[16px]" },
  { name: "Mandiri", component: MandiriLogo, opticalHeight: "h-[21px]" },
  { name: "BNI", component: BniLogo, opticalHeight: "h-[15px]" },
  { name: "BRI", component: BriLogo, opticalHeight: "h-[17px]" },
  { name: "GoPay", component: GopayLogo, opticalHeight: "h-[17px]" },
  { name: "OVO", component: OvoLogo, opticalHeight: "h-[16px]" },
  { name: "DANA", component: DanaLogo, opticalHeight: "h-[16px]" },
  { name: "Visa", component: VisaLogo, opticalHeight: "h-[15px]" },
  { name: "Mastercard", component: MastercardLogo, opticalHeight: "h-[20px]" },
  { name: "Midtrans", component: MidtransLogo, opticalHeight: "h-[18px]" },
];
